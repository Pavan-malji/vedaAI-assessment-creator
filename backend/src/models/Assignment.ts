import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus, AssignmentConfig } from '../types';

export interface IAssignment extends AssignmentConfig, Document {
  status: JobStatus;
  jobId: string;
  createdAt: Date;
  userId: mongoose.Types.ObjectId;
}

const AssignmentSchema = new Schema<IAssignment>({
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  dueDate: { type: String, required: true },
  questionTypes: { type: [String], required: true },
  numberOfQuestions: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: { type: String, default: '' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  jobId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
