import { Worker, Job } from 'bullmq';
import { redis, setCache } from '../lib/redis';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { getIO } from '../socket';
import { generateQuestionPaper } from '../lib/ai';

export const aiWorker = new Worker('assignment-generation', async (job: Job) => {
  const { assignmentId } = job.data;
  console.log(`Started processing job ${job.id} for assignment ${assignmentId}`);

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }

    // Update assignment status to 'processing'
    assignment.status = 'processing';
    await assignment.save();
    console.log(`Assignment ${assignmentId} status updated to 'processing'`);

    // Emit progress event
    const ioInstance = getIO();
    if (ioInstance) {
      ioInstance.emit('job:progress', { assignmentId, status: 'processing', progress: 50 });
      console.log(`Emitted job:progress for assignment ${assignmentId}`);
    }

    // Generate question paper
    console.log(`Calling Gemini AI for assignment ${assignmentId}`);
    const paper = await generateQuestionPaper(assignment.toObject());

    // Save result
    const result = new Result({
      assignmentId: assignment._id,
      paper
    });
    await result.save();

    // Cache result
    await setCache(`result:${assignmentId}`, paper, 3600);

    // Update assignment status to 'completed'
    assignment.status = 'completed';
    await assignment.save();

    // Emit socket event
    const io = getIO();
    if (io) {
      io.emit('job:done', { assignmentId, paper });
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
      io.emit('job:failed', { assignmentId, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    throw error;
  }
}, { connection: redis });

aiWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
