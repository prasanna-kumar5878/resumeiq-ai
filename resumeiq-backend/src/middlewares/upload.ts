import multer from 'multer';
import { AppError } from '../utils/appError.js';

// Persist the file buffer inside local RAM temporarily instead of writing directly to disk
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain', // .txt
];

export const uploadInterceptor = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes Max Boundary Check
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Unsupported format. Please upload a valid PDF, DOCX, or TXT document.', 400) as any, false);
    }
  },
});