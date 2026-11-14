import assert from "node:assert/strict";
import { buildDemoDataset, DEMO_COMPANY_COUNT, JOBS_PER_DEMO_COMPANY } from "./utils/demoSeedData.js";
import { isIndianLocation } from "./utils/indiaLocation.js";

const { companies, jobs } = buildDemoDataset();
const emailFor = (company) => `demo+${company.slug}@careernest.test`;
const phoneFor = (index) => String(9000000000 + index);
const assertUnique = (values, message) => assert.equal(new Set(values).size, values.length, message);

assert.ok(companies.length >= 50, "At least 50 demo companies should be generated.");
assert.ok(jobs.length >= 150, "At least 150 demo jobs should be generated.");
assert.equal(DEMO_COMPANY_COUNT, companies.length);
assert.equal(JOBS_PER_DEMO_COMPANY, 4);
assertUnique(companies.map(({ name }) => name.toLowerCase()), "Company names must be unique.");
assertUnique(companies.map(emailFor), "Demo recruiter emails must be unique.");
assertUnique(companies.map((_, index) => phoneFor(index)), "Demo recruiter phone numbers must be unique.");
assertUnique(jobs.map(({ jobId }) => jobId.toLowerCase()), "Demo job IDs must be unique.");
const includedJobTitles = new Set(jobs.map(({ title }) => title));
for (const requiredTitle of [
  "Software Developer",
  "Java Developer",
  "Python Developer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Business Analyst",
  "Data Analyst",
  "Data Scientist",
  "Digital Marketing Executive",
  "HR Executive",
  "Sales Executive",
  "Business Development Executive",
  "Customer Support Executive",
  "Financial Analyst",
  "Accountant",
  "UI/UX Designer",
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "Network Engineer",
  "Graduate Trainee",
  "Marketing Intern",
]) {
  assert.ok(includedJobTitles.has(requiredTitle), `Seed should include ${requiredTitle}.`);
}

for (const company of companies) {
  const companyJobs = jobs.filter(({ companySlug }) => companySlug === company.slug);
  assert.ok(companyJobs.length >= 3 && companyJobs.length <= 5, `${company.name} needs 3-5 jobs.`);
  assert.ok(company.industry && company.description && company.website && company.logo);
  assert.equal(company.status, "Active");
  assert.ok(isIndianLocation(company.location, company.country, { allowRemote: false }), `${company.name} needs a supported Indian location.`);
  assert.ok(company.contactEmail && company.contactPhone);
}

for (const job of jobs) {
  assert.ok(job.title && job.description && job.responsibilities.length && job.requirements.length);
  assert.ok(job.qualification && job.workMode && job.applicationDeadline);
  assert.ok(Number.isFinite(job.salaryMin) && Number.isFinite(job.salaryMax) && job.salaryMin <= job.salaryMax);
  assert.ok(["Active", "Inactive"].includes(job.status));
  assert.ok(companies.some(({ slug }) => slug === job.companySlug));
}

console.log(`DEMO DATA TESTS PASSED: ${companies.length} companies, ${companies.length} recruiter accounts, ${jobs.length} jobs.`);
