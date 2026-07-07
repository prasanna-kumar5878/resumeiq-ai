import { Schema, model, Document } from 'mongoose';

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  version: number;
  parsedData: {
    personalInfo: {
      fullName: string;
      email?: string;
      phone?: string;
      links: { platform: string; url: string }[];
    };
    education: { institution: string; degree: string; fieldOfStudy: string; startYear: string; endYear: string; gpa?: string }[];
    experience: { company: string; position: string; location?: string; startDate: string; endDate?: string; highlights: string[] }[];
    skills: { hardSkills: string[]; softSkills: string[] };
    projects: { title: string; description: string; technologies: string[]; url?: string }[];
    certifications: string[];
    languages: string[];
  };
  atsAnalysis: {
    overallScore: number;
    formattingScore: number;
    keywordScore: number;
    impactScore: number;
    suggestions: string[];
    criticalFixes: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'Untitled Resume' },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    version: { type: Number, default: 1 },
    parsedData: {
      personalInfo: {
        fullName: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        links: [{ platform: String, url: String }],
      },
      education: [
        { institution: String, degree: String, fieldOfStudy: String, startYear: String, endYear: String, gpa: String },
      ],
      experience: [
        { company: String, position: String, location: String, startDate: String, endDate: String, highlights: [String] },
      ],
      skills: {
        hardSkills: { type: [String], default: [] },
        softSkills: { type: [String], default: [] },
      },
      projects: [{ title: String, description: String, technologies: [String], url: String }],
      certifications: { type: [String], default: [] },
      languages: { type: [String], default: [] },
    },
    atsAnalysis: {
      overallScore: { type: Number, required: true, min: 0, max: 100 },
      formattingScore: { type: Number, default: 0 },
      keywordScore: { type: Number, default: 0 },
      impactScore: { type: Number, default: 0 },
      suggestions: { type: [String], default: [] },
      criticalFixes: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

// Highly performing compound indices for recruiter searches & dashboards
ResumeSchema.index({ userId: 1 });
ResumeSchema.index({ 'parsedData.skills.hardSkills': 1 });
ResumeSchema.index({ 'atsAnalysis.overallScore': -1 });

export const Resume = model<IResume>('Resume', ResumeSchema);