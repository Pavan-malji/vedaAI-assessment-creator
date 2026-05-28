import { Worker, Job } from 'bullmq';
import { redis, setCache } from '../lib/redis';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { getIO } from '../socket';
import { generateQuestionPaper } from '../lib/ai';

export const aiWorker = new Worker('assignment-generation', async (job: Job) => {
  const { assignmentId, userId } = job.data as { assignmentId: string; userId?: string };
  console.log(`Started processing job ${job.id} for assignment ${assignmentId} user ${userId}`);

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    // Update assignment status to 'processing'
    assignment.status = 'processing';
    await assignment.save();
    console.log(`Assignment ${assignmentId} status updated to 'processing'`);

    // Emit progress event to user room if available
    const ioInstance = getIO();
    if (ioInstance) {
      if (userId) ioInstance.to(`user:${userId}`).emit('job:progress', { assignmentId, status: 'processing', progress: 50 });
      else ioInstance.emit('job:progress', { assignmentId, status: 'processing', progress: 50 });
      console.log(`Emitted job:progress for assignment ${assignmentId}`);
    }

    // Generate question paper
    console.log(`Calling Gemini AI for assignment ${assignmentId}`);
    const paper = await generateQuestionPaper(assignment.toObject());

    // Save result
    const result = new Result({
      assignmentId: assignment._id,
      paper,
      userId: userId ? userId : assignment.userId
    });
    await result.save();

    // Cache result scoped by user
    const cacheKey = userId ? `result:${userId}:${assignmentId}` : `result:${assignment.userId}:${assignmentId}`;
    await setCache(cacheKey, paper, 3600);

    // Update assignment status to 'completed'
    assignment.status = 'completed';
    await assignment.save();

    // Emit socket event
    const io = getIO();
    if (io) {
      if (userId) io.to(`user:${userId}`).emit('job:done', { assignmentId, paper });
      else io.emit('job:done', { assignmentId, paper });
    }

    console.log(`Successfully completed job ${job.id} for assignment ${assignmentId}`);
  } catch (error) {
    console.error(`Error processing job ${job.id} for assignment ${assignmentId}:`, error);
    
    try {
      const assignment = await Assignment.findById(assignmentId);
      if (assignment) {
        assignment.status = 'failed';
        await assignment.save();
      }
    } catch (e) {
        // ignore
    }

    const io = getIO();
    if (io) {
      if (job.data?.userId) io.to(`user:${job.data.userId}`).emit('job:failed', { assignmentId, error: error instanceof Error ? error.message : 'Unknown error' });
      else io.emit('job:failed', { assignmentId, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    throw error;
  }
}, { connection: redis });

aiWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
