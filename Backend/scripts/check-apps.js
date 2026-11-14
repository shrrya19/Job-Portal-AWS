import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Application } from '../models/application.model.js';
import '../models/user.model.js';
import '../models/job.model.js';

dotenv.config({ path: './Backend/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const apps = await Application.find({}).populate('applicant', 'fullName email').populate('job', 'title');
  console.log('TOTAL APPLICATIONS:', apps.length);
  for (const app of apps) {
    console.log(JSON.stringify({
      id: app._id,
      applicant: app.applicant?.fullName,
      email: app.applicant?.email,
      job: app.job?.title,
      status: app.status,
      stageDetails: app.stageDetails,
      stageHistory: app.stageHistory
    }, null, 2));
  }
  await mongoose.disconnect();
}

run().catch(console.error);
