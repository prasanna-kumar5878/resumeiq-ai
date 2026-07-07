import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Establish secure cloud database pool connection
  await connectDB();

  // 2. Open HTTP network socket
  app.listen(PORT, () => {
    console.log(`🚀 ResumeIQ Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();