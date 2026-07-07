import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary.js';
import { resumeParsingQueue } from '../config/queue.js';
import { Resume } from '../models/Resume.js';
import { AppError } from '../utils/appError.js';

export const queueResumeProcessing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No resume file asset attached to request.', 400));
    }

    if (!req.user) {
      return next(new AppError('Authentication context missing.', 401));
    }

    // Convert raw memory buffers into safe Data-URI strings for streaming to Cloudinary
    const base64File = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

    // Upload asset to Cloudinary under a dedicated folder structure
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'resumeiq_vault',
      resource_type: 'auto',
    });

    // Create a skeleton placeholder resume in MongoDB with standard default metrics
    const initialResumeInstance = await Resume.create({
      userId: req.user.id,
      title: req.file.originalname || 'Uploaded Resume',
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      version: 1,
      parsedData: {
        personalInfo: { fullName: req.user.email.split('@')[0] }, // Temporary assignment
        education: [],
        experience: [],
        skills: { hardSkills: [], softSkills: [] },
        projects: [],
      },
      atsAnalysis: {
        overallScore: 0, // Set to 0 until the worker updates it
        suggestions: ['Processing in progress...'],
      },
    });

    // Enqueue the job for asymmetric worker extraction
    const enqueuedJob = await resumeParsingQueue.add('extract-and-score', {
      resumeId: initialResumeInstance._id,
      userId: req.user.id,
      fileUrl: uploadResult.secure_url,
      mimeType: req.file.mimetype,
    });

    // Return a 202 Accepted status code to indicate background work has started
    res.status(202).json({
      status: 'accepted',
      message: 'Resume received and added to processing pipeline.',
      data: {
        resumeId: initialResumeInstance._id,
        jobId: enqueuedJob.id,
        statusUrl: `/api/v1/resumes/status/${initialResumeInstance._id}`,
      },
    });
  } catch (error) {
    return next(error);
  }
};