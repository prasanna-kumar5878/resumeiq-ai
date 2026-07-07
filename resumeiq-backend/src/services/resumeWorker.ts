import { Worker, Job } from 'bullmq';
import axios from 'axios';
import * as pdfParse from 'pdf-parse'; // 1. Change to namespace import
import { redisConnection } from '../config/queue.js';
import { Resume } from '../models/Resume.js';
import { analyzeResumeText } from './aiService.js';

// 2. Create a safe runtime interop wrapper helper
const parsePDF = (pdfParse as any).default || pdfParse;

export const initResumeWorker = () => {
  const worker = new Worker(
    'resume-parsing',
    async (job: Job) => {
      const { resumeId, fileUrl } = job.data;
      console.log(`📦 System Event [Job ${job.id}]: Initializing analysis pipeline`);

      try {
        let rawExtractedText = '';

        const documentResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(documentResponse.data);

        if (fileUrl.endsWith('.pdf') || true) {
          // 3. Use the safe interop wrapper function here
          const parsedMeta = await parsePDF(fileBuffer);
          rawExtractedText = parsedMeta.text;
        }

        if (!rawExtractedText || rawExtractedText.trim().length === 0) {
          throw new Error('Unable to extract printable textual assets from document target.');
        }

        const aiAnalysisResult = await analyzeResumeText(rawExtractedText);

        await Resume.findByIdAndUpdate(resumeId, {
          $set: {
            parsedData: {
              personalInfo: aiAnalysisResult.personalInfo,
              education: aiAnalysisResult.education,
              experience: aiAnalysisResult.experience,
              skills: aiAnalysisResult.skills,
              projects: aiAnalysisResult.projects,
              certifications: aiAnalysisResult.certifications,
              languages: aiAnalysisResult.languages,
            },
            atsAnalysis: {
              overallScore: aiAnalysisResult.atsAnalysis.overallScore,
              formattingScore: aiAnalysisResult.atsAnalysis.formattingScore,
              keywordScore: aiAnalysisResult.atsAnalysis.keywordScore,
              impactScore: aiAnalysisResult.atsAnalysis.impactScore,
              suggestions: aiAnalysisResult.atsAnalysis.suggestions,
              criticalFixes: aiAnalysisResult.atsAnalysis.criticalFixes,
            },
          },
        });

        console.log(`✅ System Event [Job ${job.id}]: Engine successfully completed parsing`);
      } catch (workerError: any) {
        console.error(`❌ Background Thread Exception Processing Job ${job.id}:`, workerError.message);
        await Resume.findByIdAndUpdate(resumeId, {
          $set: {
            'atsAnalysis.suggestions': [`Failed during background processing: ${workerError.message}`],
          },
        });
        throw workerError;
      }
    },
    { connection: redisConnection as any }
  );

  worker.on('failed', (job, err) => {
    console.error(`💥 Critical Worker Processing Pipeline Blocked on ID ${job?.id}:`, err.message);
  });
};