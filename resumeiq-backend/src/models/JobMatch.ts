import { Schema, model, Document } from 'mongoose';

export interface IJobMatch extends Document {
  userId: Schema.Types.ObjectId;
  resumeId: Schema.Types.ObjectId;
  companyName?: string;
  jobTitle: string;
  jobDescriptionText: string;
  matchPercentage: number;
  missingSkills: string[];
  recommendedKeywords: string[];
  generatedCoverLetter?: string;
  interviewPrepQuestions: { question: string; category: 'technical' | 'behavioral' | 'hr'; internalHint?: string }[];
  createdAt: Date;
}

const JobMatchSchema = new Schema<IJobMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    companyName: { type: String, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    jobDescriptionText: { type: String, required: true },
    matchPercentage: { type: Number, required: true, min: 0, max: 100 },
    missingSkills: { type: [String], default: [] },
    recommendedKeywords: { type: [String], default: [] },
    generatedCoverLetter: { type: String },
    interviewPrepQuestions: [
      {
        question: String,
        category: { type: String, enum: ['technical', 'behavioral', 'hr'] },
        internalHint: String,
      },
    ],
  },
  { timestamps: true }
);

JobMatchSchema.index({ userId: 1, createdAt: -1 });

export const JobMatch = model<IJobMatch>('JobMatch', JobMatchSchema);