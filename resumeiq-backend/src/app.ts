import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
//@ts-ignore
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js'; // New import
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './utils/appError.js';
import { initResumeWorker } from './services/resumeWorker.js'; // New import

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routing mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes); // New route registration

// Spin up background message consumer threads 
if (process.env.NODE_ENV !== 'test') {
  initResumeWorker();
}

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;