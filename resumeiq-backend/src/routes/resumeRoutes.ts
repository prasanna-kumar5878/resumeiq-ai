import { Router } from 'express';
import { queueResumeProcessing } from '../controllers/resumeController.js';
import { protect } from '../middlewares/authGuard.js';
import { uploadInterceptor } from '../middlewares/upload.js';

const router = Router();

// Secure file uploads using JWT token screening and Multer checks
router.post('/upload', protect, uploadInterceptor.single('resume'), queueResumeProcessing);

export default router;