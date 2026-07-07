import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary.js';
import { resumeParsingQueue } from '../config/queue.js';
import { Resume } from '../models/index.js';
import { AppError } from '../utils/appError.js';

export const queueResumeProcessing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new AppError('No resume file asset attached to request.', 400));
    }

    if (!req.user) {
      return next(new AppError('Authentication context missing.', 401));
    }

    const base64File = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'resumeiq_vault',
      resource_type: 'auto',
    });

    const initialResumeInstance = await Resume.create({
      userId: req.user.id, 
      title: req.file.originalname || 'Untitled Resume',
      fileUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      version: 1,
      parsedData: {
        personalInfo: { fullName: req.user.email.split('@')[0] }, 
        education: [],
        experience: [],
        skills: { hardSkills: [], softSkills: [] },
        projects: [],
      },
      atsAnalysis: {
        overallScore: 0,
        suggestions: ['Processing in progress...'],
      },
    });

    // Wrap identifiers securely in a String function for BullMQ
    await resumeParsingQueue.add('extract-and-score', {
      resumeId: String(initialResumeInstance._id),
      userId: req.user.id,
      fileUrl: uploadResult.secure_url,
      mimeType: req.file.mimetype,
    });

    res.status(202).json({
      status: 'accepted',
      message: 'Resume received and added to processing pipeline.',
      data: {
        resumeId: initialResumeInstance._id,
        statusUrl: `/api/v1/resumes/status/${initialResumeInstance._id}`,
      },
    });
  } catch (error) {
    return next(error);
  }
};