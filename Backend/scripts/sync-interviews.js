import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Application } from '../models/application.model.js';

dotenv.config({ path: './Backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const now = new Date();
  const apps = await Application.find({
    'stageDetails.interviewDate': { $gte: now },
    status: { $in: ['shortlisted', 'under review', 'applied'] }
  });

  console.log(`Found ${apps.length} application(s) with scheduled interviews to sync.`);

  for (const app of apps) {
    console.log(`Updating app ${app._id} (current status: ${app.status}) to 'interview scheduled'`);
    app.status = 'interview scheduled';
    if (!Array.isArray(app.stageHistory)) app.stageHistory = [];
    app.stageHistory.push({
      stage: 'interview scheduled',
      updatedAt: new Date(),
      note: 'Interview scheduled by recruiter.'
    });
    await app.save();
  }

  console.log('Sync complete.');
  await mongoose.disconnect();
}

run().catch(console.error);
