import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { buildDemoDataset, DEMO_COMPANY_COUNT, JOBS_PER_DEMO_COMPANY } from "../utils/demoSeedData.js";
import connectDB from "../utils/db.js";

const isDryRun = process.argv.includes("--dry-run");
const passwordRequirements = /^[A-Z](?=.*\d)(?=.*[^A-Za-z0-9\s]).{11,}$/;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const assertUniqueDataset = ({ companies, jobs }) => {
  const companyNames = companies.map(({ name }) => name.toLowerCase());
  const recruiterEmails = companies.map(({ slug }) => `demo+${slug}@careernest.test`);
  const recruiterPhones = companies.map((_, index) => String(9000000000 + index));
  const jobIds = jobs.map(({ jobId }) => jobId.toLowerCase());
  const jobKeys = jobs.map(({ companySlug, title, location, experienceLevel }) =>
    `${companySlug}|${title.toLowerCase()}|${location.toLowerCase()}|${experienceLevel}`
  );
  const unique = (values) => new Set(values).size === values.length;
  if (!unique(companyNames) || !unique(recruiterEmails) || !unique(recruiterPhones) ||
      !unique(jobIds) || !unique(jobKeys)) {
    throw new Error("Demo dataset contains duplicate company, recruiter, or job identifiers.");
  }
  for (const job of jobs) {
    if (!companies.some((company) => company.slug === job.companySlug)) {
      throw new Error(`Demo job ${job.jobId} does not have a matching company.`);
    }
  }
};

const getAvailableCompanyName = async (seedCompany) => {
  let name = seedCompany.name;
  let suffix = 0;
  while (true) {
    const company = await Company.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" }
    }).select("+isDemoData");
    if (!company || company.isDemoData) {
      return { name, company };
    }
    suffix += 1;
    name = `${seedCompany.name} Demo${suffix > 1 ? ` ${suffix}` : ""}`;
  }
};

const seedDemoData = async () => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo data seeding is disabled when NODE_ENV=production.");
  }
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Set ALLOW_DEMO_SEED=true in Backend/.env to explicitly enable demo seeding.");
  }
  if (typeof process.env.DEMO_RECRUITER_PASSWORD !== "string" ||
      !passwordRequirements.test(process.env.DEMO_RECRUITER_PASSWORD)) {
    throw new Error(
      "Set DEMO_RECRUITER_PASSWORD to a 12+ character password starting with uppercase and including a number and symbol."
    );
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to seed demo data.");
  }

  const dataset = buildDemoDataset();
  assertUniqueDataset(dataset);
  await connectDB();

  const companyBySlug = new Map();
  let companiesCreated = 0;
  let recruitersCreated = 0;
  let jobsCreated = 0;

  for (const seedCompany of dataset.companies) {
    const { name: availableName, company: existingCompany } = await getAvailableCompanyName(seedCompany);
    const actualSlug = slugify(availableName);
    const email = `demo+${actualSlug}@careernest.test`;
    const normalizedPhone = String(9000000000 + seedCompany.index);
    let recruiter = await User.findOne({ email }).select("+isDemoData");

    if (recruiter && !recruiter.isDemoData) {
      throw new Error(`Refusing to overwrite the non-demo account ${email}.`);
    }
    const recruiterAlreadySeeded = Boolean(recruiter);
    const phoneOwner = await User.findOne({ phoneNumberNormalized: normalizedPhone }).select("+isDemoData");
    if (phoneOwner && (!phoneOwner.isDemoData || phoneOwner.email !== email)) {
      throw new Error(`Demo phone number ${normalizedPhone} is already assigned to a different account.`);
    }

    const recruiterId = recruiter?._id || new mongoose.Types.ObjectId();
    const companyId = existingCompany?._id || new mongoose.Types.ObjectId();
    const companyData = {
      name: availableName,
      industry: seedCompany.industry,
      location: seedCompany.location,
      country: "India",
      status: "Active",
      website: `https://${actualSlug}.example`,
      description: `${availableName} is a demo employer operating in India's ${seedCompany.industry.toLowerCase()} sector. Explore its teams, projects, and career opportunities.`,
      contactEmail: `careers+${actualSlug}@careernest.demo`,
      contactPhone: `+91 ${normalizedPhone.slice(0, 5)} ${normalizedPhone.slice(5)}`,
      logo: seedCompany.logo,
      userId: recruiterId,
      isDemoData: true,
    };

    await Company.updateOne(
      { _id: companyId },
      { $set: companyData },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    if (!existingCompany) companiesCreated += 1;
    const password = await bcrypt.hash(process.env.DEMO_RECRUITER_PASSWORD, 10);
    recruiter = await User.findOneAndUpdate(
      { _id: recruiterId },
      {
        $set: {
          fullName: `${availableName} Recruiting`,
          email,
          phoneNumber: normalizedPhone,
          phoneNumberNormalized: normalizedPhone,
          password,
          role: "recruiter",
          accountStatus: "Active",
          isDemoData: true,
          profile: {
            bio: `Demo recruiter for ${availableName}.`,
            company: companyId,
            profilePhoto: ""
          }
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    companyBySlug.set(seedCompany.slug, {
      _id: companyId,
      name: availableName,
      slug: actualSlug,
      recruiterId: recruiter._id
    });
    if (!recruiterAlreadySeeded) recruitersCreated += 1;
  }

  for (const seedJob of dataset.jobs) {
    const company = companyBySlug.get(seedJob.companySlug);
    if (!company) throw new Error(`No seeded recruiter/company found for ${seedJob.jobId}.`);
    const existingJob = await Job.findOne({ jobId: seedJob.jobId }).select("+isDemoData");
    if (existingJob && !existingJob.isDemoData) {
      throw new Error(`Refusing to overwrite the non-demo job ${seedJob.jobId}.`);
    }
    const jobId = existingJob?._id || new mongoose.Types.ObjectId();
    const titleNormalized = seedJob.title.trim().replace(/\s+/g, " ").toLowerCase();
    const jobData = {
      ...seedJob,
      company: company._id,
      created_by: company.recruiterId,
      companySlug: undefined,
      titleNormalized,
      jobIdNormalized: seedJob.jobId.toLowerCase(),
      jobIdLegacyNormalized: undefined,
      isDemoData: true,
    };
    delete jobData.companySlug;
    await Job.updateOne(
      { _id: jobId },
      { $set: jobData },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    if (!existingJob) jobsCreated += 1;
  }

  const [seededCompanies, seededRecruiters, jobsByCompany] = await Promise.all([
    Company.find({ isDemoData: true }).select("_id userId").lean(),
    User.find({ isDemoData: true, role: "recruiter" })
      .select("_id email phoneNumberNormalized profile.company accountStatus")
      .lean(),
    Job.aggregate([
      { $match: { isDemoData: true } },
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 },
          owners: { $addToSet: "$created_by" }
        }
      }
    ])
  ]);
  const companyById = new Map(seededCompanies.map((company) => [String(company._id), company]));
  const recruiterById = new Map(seededRecruiters.map((recruiter) => [String(recruiter._id), recruiter]));
  const jobCountByCompany = new Map(jobsByCompany.map((entry) => [String(entry._id), entry]));
  for (const seedCompany of dataset.companies) {
    const expected = companyBySlug.get(seedCompany.slug);
    const storedCompany = companyById.get(String(expected._id));
    const storedRecruiter = recruiterById.get(String(expected.recruiterId));
    const jobSummary = jobCountByCompany.get(String(expected._id));
    if (!storedCompany || String(storedCompany.userId) !== String(expected.recruiterId) ||
        !storedRecruiter || String(storedRecruiter.profile?.company) !== String(expected._id) ||
        storedRecruiter.accountStatus !== "Active" ||
        jobSummary?.count !== JOBS_PER_DEMO_COMPANY ||
        jobSummary.owners.length !== 1 ||
        String(jobSummary.owners[0]) !== String(expected.recruiterId)) {
      throw new Error(`Demo ownership/count verification failed for ${seedCompany.name}.`);
    }
  }

  const [companyCount, recruiterCount, jobCount] = await Promise.all([
    Company.countDocuments({ isDemoData: true }),
    User.countDocuments({ isDemoData: true, role: "recruiter" }),
    Job.countDocuments({ isDemoData: true })
  ]);
  console.log(JSON.stringify({
    message: "Demo data seed complete.",
    inserted: {     companies: companiesCreated, recruiters: recruitersCreated, jobs: jobsCreated },
    totals: { companies: companyCount, recruiters: recruiterCount, jobs: jobCount },
    login: "demo+<company-slug>@careernest.test (shared password from DEMO_RECRUITER_PASSWORD)"
  }, null, 2));
};

if (isDryRun) {
  const dataset = buildDemoDataset();
  assertUniqueDataset(dataset);
  console.log(JSON.stringify({
    dryRun: true,
    companies: dataset.companies.length,
    recruiters: dataset.companies.length,
    jobs: dataset.jobs.length,
    jobsPerCompany: JOBS_PER_DEMO_COMPANY,
    activeJobs: dataset.jobs.filter(({ status }) => status === "Active").length,
    inactiveJobs: dataset.jobs.filter(({ status }) => status === "Inactive").length,
    firstRecruiter: `demo+${dataset.companies[0].slug}@careernest.test`
  }, null, 2));
} else {
  seedDemoData()
    .catch((error) => {
      console.error("Demo data seeding failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      if (mongoose.connection.readyState) await mongoose.disconnect();
    });
}
