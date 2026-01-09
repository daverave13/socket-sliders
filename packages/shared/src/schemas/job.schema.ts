import { z } from 'zod';
import { SocketConfigSchema } from './socket.schema.js';

/**
 * Job status enum
 */
export const JobStatusSchema = z.enum([
  'pending',    // Job created, waiting in queue
  'active',     // Worker is processing the job
  'completed',  // Job finished successfully
  'failed',     // Job failed with error
  'stalled',    // Job exceeded timeout or worker died
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

/**
 * Job submission payload (client → API) - single socket
 */
export const JobSubmissionSchema = z.object({
  socketConfig: SocketConfigSchema,
  email: z.string().email().optional(), // Optional for future notifications
});
export type JobSubmission = z.infer<typeof JobSubmissionSchema>;

/**
 * Batch job submission payload (client → API) - multiple sockets
 */
export const BatchJobSubmissionSchema = z.object({
  socketConfigs: z.array(SocketConfigSchema).min(1).max(20),
  email: z.string().email().optional(),
});
export type BatchJobSubmission = z.infer<typeof BatchJobSubmissionSchema>;

/**
 * Job data stored in queue/database
 */
export const JobDataSchema = z.object({
  id: z.string().uuid(),
  socketConfig: SocketConfigSchema,
  status: JobStatusSchema,
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
  artifactPath: z.string().optional(), // Path to generated ZIP file
  email: z.string().email().optional(),
});
export type JobData = z.infer<typeof JobDataSchema>;

/**
 * Job response (API → client)
 */
export const JobResponseSchema = z.object({
  id: z.string().uuid(),
  status: JobStatusSchema,
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
  downloadUrl: z.string().url().optional(), // Present when status is 'completed'
});
export type JobResponse = z.infer<typeof JobResponseSchema>;

/**
 * Job progress update (worker → queue)
 */
export const JobProgressSchema = z.object({
  step: z.enum([
    'validating',
    'generating_scad',
    'executing_openscad',
    'validating_stl',
    'creating_zip',
    'storing_artifact',
  ]),
  message: z.string(),
  percentage: z.number().min(0).max(100),
});
export type JobProgress = z.infer<typeof JobProgressSchema>;
