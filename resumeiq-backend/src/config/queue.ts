import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Shared Redis connection instance
export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // Critical requirement enforced by BullMQ
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Main processing queue for parsing tasks
export const resumeParsingQueue = new Queue('resume-parsing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Automatically retry 3 times if an AI API drops out
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5 seconds before retrying
    },
    removeOnComplete: true, // Clean up historical records to optimize Redis memory usage
    removeOnFail: false,   // Retain failures for debugging logs
  },
});

console.log('🚀 BullMQ Distributed Processing Queue Initialized.');