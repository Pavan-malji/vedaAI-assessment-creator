import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

export const assignmentQueue = new Queue('assignment-generation', {
  connection: redis,
});

export const addAssignmentJob = async (assignmentId: string) => {
  try {
    const job = await assignmentQueue.add('generate', { assignmentId });
    console.log(`Added job ${job.id} for assignment ${assignmentId}`);
    return job.id;
  } catch (error) {
    console.error('Error adding assignment job:', error);
    throw error;
  }
};
