import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { JobSubmission } from '@socketsliders/shared';
import { config } from './config.js';
import { logger } from './logger.js';
import { OpenSCADService } from './services/openscad.service.js';

const connection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
});

const openscadService = new OpenSCADService();

const worker = new Worker<JobSubmission>(
  'socket-jobs',
  async (job: Job<JobSubmission>) => {
    logger.info({ jobId: job.id, socketConfig: job.data.socketConfig }, 'Processing job');

    try {
      // Update progress: validating
      await job.updateProgress({
        step: 'validating',
        message: 'Validating socket configuration',
        percentage: 10,
      });

      // Update progress: generating SCAD
      await job.updateProgress({
        step: 'generating_scad',
        message: 'Generating OpenSCAD file',
        percentage: 20,
      });

      // Process the job
      const artifactPath = await openscadService.processJob(
        job.id!,
        job.data.socketConfig
      );

      // Update progress: completed
      await job.updateProgress({
        step: 'storing_artifact',
        message: 'Artifact stored successfully',
        percentage: 100,
      });

      logger.info({ jobId: job.id, artifactPath }, 'Job completed successfully');

      return { artifactPath };
    } catch (error: any) {
      logger.error({ jobId: job.id, error: error.message, stack: error.stack }, 'Job failed');
      throw error;
    }
  },
  {
    connection,
    concurrency: config.worker.concurrency,
    limiter: {
      max: 10, // Max 10 jobs per duration
      duration: 60000, // Per 60 seconds
    },
  }
);

// Worker event handlers
worker.on('completed', (job: Job) => {
  logger.info({ jobId: job.id }, 'Job completed event');
});

worker.on('failed', (job: Job | undefined, error: Error) => {
  logger.error({ jobId: job?.id, error: error.message }, 'Job failed event');
});

worker.on('error', (error: Error) => {
  logger.error({ error: error.message }, 'Worker error');
});

worker.on('stalled', (jobId: string) => {
  logger.warn({ jobId }, 'Job stalled');
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down worker gracefully...');
  await worker.close();
  await connection.quit();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info(
  {
    concurrency: config.worker.concurrency,
    timeout: config.worker.jobTimeout,
    redis: `${config.redis.host}:${config.redis.port}`,
  },
  'Worker started'
);
