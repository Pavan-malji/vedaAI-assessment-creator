import mongoose, { Schema, Document } from 'mongoose';
import { QuestionPaper } from '../types';

export interface IResult extends Document {
  assignmentId: mongoose.Types.ObjectId;
  paper: QuestionPaper;
  createdAt: Date;
}

const ResultSchema = new Schema<IResult>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  paper: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Result = mongoose.model<IResult>('Result', ResultSchema);
