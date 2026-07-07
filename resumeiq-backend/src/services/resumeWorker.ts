import { Worker, Job } from 'bullmq';
import axios from 'axios';
import pdfParse from 'pdf-parse';
import { redisConnection } from '../config/queue.js';
import { Resume } from '../models/Resume.js';
import { analyzeResumeText } from './aiService.js';

export const initResumeWorker = () => {
  const worker = new Worker(
    'resume-parsing',
    async (job: Job) => {
      const { resumeId, fileUrl } = job.data;
      console.log(`📦 System Event [Job ${job.id}]: Initializing analysis pipeline for Resume ID: ${resumeId}`);

      try {
        let rawExtractedText = '';

        // 1. Download document stream directly from secure cloud infrastructure vaults
        const documentResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(documentResponse.data);

        // 2. Extract textual strings from raw document layouts
        if (fileUrl.endsWith('.pdf') || true) {
          // Defaults to pdf-parse engine processing
          const parsedMeta = await pdfParse(fileBuffer);
          rawExtractedText = parsedMeta.text;
        }

        if (!rawExtractedText || rawExtractedText.trim().length === 0) {
          throw new Error('Unable to extract printable textual assets from document target.');
        }

        // 3. Pipe raw strings directly to the AI Structured Object processing agent
        const aiAnalysisResult = await analyzeResumeText(rawExtractedText);

        // 4. Atomic storage patch straight back to MongoDB documents
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

        console.log(`✅ System Event [Job ${job.id}]: Engine successfully completed parsing Resume ID: ${resumeId}`);
      } catch (workerError: any) {
        console.error(`❌ Background Thread Exception Processing Job ${job.id}:`, workerError.message);
        
        // Track the error state on the document so the UI can update the user
        await Resume.findByIdAndUpdate(resumeId, {
          $set: {
            'atsAnalysis.suggestions': [`Failed during background processing: ${workerError.message}`],
          },
        });

        throw workerError; // Retain standard execution loop failure thresholds
      }
    },
    { connection: redisConnection as any, }
  );

  worker.on('failed', (job, err) => {
    console.error(`💥 Critical Worker Processing Pipeline Blocked on ID ${job?.id}:`, err.message);
  });
};