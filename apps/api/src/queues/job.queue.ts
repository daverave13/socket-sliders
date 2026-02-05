import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import type { JobSubmission, BatchJobSubmission } from '@socketsliders/shared';
import { config } from '../config.js';

const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
});

export const jobQueue = new Queue<JobSubmission | BatchJobSubmission>('socket-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: config.artifacts.maxAge / 1000, // Convert to seconds
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },
});

// Graceful shutdown
export async function closeQueue() {
  await jobQueue.close();
  await connection.quit();
}
