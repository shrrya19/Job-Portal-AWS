import mongoose from 'mongoose';
import { Job } from "../models/job.model.js";

const normalizeJobId = (value) =>
    typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";

const migrateJobIdentifiers = async () => {
    const jobs = await Job.collection.find(
        { jobId: { $type: "string" } },
        { projection: { _id: 1, jobId: 1, title: 1, location: 1, locations: 1 } }
    ).toArray();
    const jobsByNormalizedId = new Map();
    for (const job of jobs) {
        const normalizedId = normalizeJobId(job.jobId);
        if (!normalizedId) continue;
        const matches = jobsByNormalizedId.get(normalizedId) || [];
        matches.push(job._id.toString());
        jobsByNormalizedId.set(normalizedId, matches);
    }

    const duplicateIds = [...jobsByNormalizedId]
        .filter(([, ids]) => ids.length > 1)
        .map(([jobId]) => jobId);
    const duplicateIdSet = new Set(duplicateIds);

    const collectionExists = await mongoose.connection.db
        .listCollections({ name: Job.collection.name }, { nameOnly: true })
        .hasNext();
    if (collectionExists) {
        const existingIndexes = await Job.collection.indexes();
        if (existingIndexes.some((index) => index.name === "unique_company_job_identity")) {
            await Job.collection.dropIndex("unique_company_job_identity");
        }
    }

    const operations = jobs.map((job) => ({
        updateOne: {
            filter: { _id: job._id },
            update: {
                $set: {
                    ...(normalizeJobId(job.jobId) && !duplicateIdSet.has(normalizeJobId(job.jobId))
                        ? { jobIdNormalized: normalizeJobId(job.jobId) }
                        : {}),
                    ...(normalizeJobId(job.jobId) && duplicateIdSet.has(normalizeJobId(job.jobId))
                        ? { jobIdLegacyNormalized: normalizeJobId(job.jobId) }
                        : {}),
                    ...(typeof job.title === "string"
                        ? { titleNormalized: job.title.trim().replace(/\s+/g, " ").toLowerCase() }
                        : {}),
                    ...(!Array.isArray(job.locations) || !job.locations.length
                        ? { locations: typeof job.location === "string" && job.location.trim() ? [job.location] : [] }
                        : {}),
                },
                $unset: {
                    ...(!normalizeJobId(job.jobId) || duplicateIdSet.has(normalizeJobId(job.jobId))
                        ? { jobIdNormalized: "" }
                        : { jobIdLegacyNormalized: "" }),
                    ...(!normalizeJobId(job.jobId) ? { jobIdLegacyNormalized: "" } : {}),
                },
            },
        },
    }));
    if (operations.length) {
        await Job.collection.bulkWrite(operations, { ordered: true });
    }

    await Job.collection.createIndex(
        { jobIdNormalized: 1 },
        {
            unique: true,
            name: "unique_job_id_normalized",
            partialFilterExpression: { jobIdNormalized: { $type: "string" } },
        }
    );
    if (duplicateIds.length) {
        console.warn(
            `${duplicateIds.length} legacy duplicate Job ID value(s) found. ` +
            "Those IDs remain blocked for new postings until the existing records are corrected."
        );
    }
};

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required.");
    }

    Job.schema.set("autoIndex", false);
    await mongoose.connect(process.env.MONGO_URI);
    await migrateJobIdentifiers();
    console.log("MongoDB connected successfully");
}

export default connectDB;