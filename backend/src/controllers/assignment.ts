import { Request, Response } from 'express';
import { z } from 'zod';
import { Assignment } from '../models/Assignment';
import { Result } from '../models/Result';
import { addAssignmentJob } from '../queues/assignmentQueue';
import { getCache } from '../lib/redis';

const createAssignmentSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z.array(z.string()).min(1, 'At least one question type is required'),
  numberOfQuestions: z.number().min(1, 'Number of questions must be at least 1'),
  marksPerQuestion: z.number().min(1, 'Marks per question must be at least 1'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  additionalInstructions: z.string().optional().default('')
});

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createAssignmentSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parseResult.error.issues
      });
      return;
    }

    const data = parseResult.data;

    const assignment = new Assignment({
      ...data,
      status: 'pending'
    });

    await assignment.save();
    console.log(`Assignment created: ${assignment._id}`);

    const jobId = await addAssignmentJob(assignment._id.toString());

    assignment.jobId = jobId ?? '';
    await assignment.save();
    console.log(`Job ${jobId} queued for assignment ${assignment._id}`);

    res.status(201).json({
      assignmentId: assignment._id,
      jobId,
      message: 'Generation started'
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check Redis cache first
    const cacheKey = `result:${id}`;
    const cachedResult = await getCache(cacheKey);

    if (cachedResult) {
      console.log(`Cache hit for assignment ${id}`);
      res.status(200).json({ source: 'cache', paper: cachedResult });
      return;
    }

    // Check MongoDB
    const result = await Result.findOne({ assignmentId: id });

    if (result) {
      console.log(`DB hit for assignment ${id}`);
      res.status(200).json({ source: 'db', paper: result.paper });
      return;
    }

    // Return current status if no result yet
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.status(200).json({ status: assignment.status });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
