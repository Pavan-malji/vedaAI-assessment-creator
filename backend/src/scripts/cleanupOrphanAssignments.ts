import { connectDB } from '../lib/mongoose';
import { Assignment } from '../models/Assignment';

const run = async () => {
  await connectDB();
  console.log('Connected to DB. Removing orphaned assignments (no userId)...');
  const res = await Assignment.deleteMany({ userId: { $exists: false } });
  console.log(`Deleted ${res.deletedCount} orphaned assignments`);
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
