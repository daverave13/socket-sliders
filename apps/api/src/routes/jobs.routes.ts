import { FastifyPluginAsync, FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { stat } from "fs/promises";
import { join } from "path";
import {
  JobSubmissionSchema,
  BatchJobSubmissionSchema,
  type JobSubmission,
  type BatchJobSubmission,
  type JobResponse,
  type JobStatus,
} from "@socketsliders/shared";
import { jobQueue } from "../queues/job.queue.js";
import { config } from "../config.js";

export const jobRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  /**
   * POST /api/v1/jobs - Submit a new job
   */
  app.post<{ Body: JobSubmission; Reply: JobResponse }>(
    "/jobs",
    async (request, reply) => {
      try {
        // Validate request body
        const submission = JobSubmissionSchema.parse(request.body);

        // Generate job ID
        const jobId = randomUUID();

        // Enqueue job
        await jobQueue.add("generate-socket", submission, {
          jobId,
        });

        app.log.info(
          { jobId, socketConfig: submission.socketConfig },
          "Job enqueued"
        );

        const response: JobResponse = {
          id: jobId,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        return reply.code(201).send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to submit job");
        throw error;
      }
    }
  );

  /**
   * POST /api/v1/jobs/batch - Submit a batch job (multiple sockets)
   */
  app.post<{ Body: BatchJobSubmission; Reply: JobResponse }>(
    "/jobs/batch",
    async (request, reply) => {
      try {
        // Validate request body
        const submission = BatchJobSubmissionSchema.parse(request.body);

        // Generate job ID
        const jobId = randomUUID();

        // Enqueue batch job
        await jobQueue.add("generate-socket-batch", submission, {
          jobId,
        });

        app.log.info(
          { jobId, count: submission.socketConfigs.length },
          "Batch job enqueued"
        );

        const response: JobResponse = {
          id: jobId,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        return reply.code(201).send(response);
      } catch (error) {
        app.log.error({ error }, "Failed to submit batch job");
        throw error;
      }
    }
  );

  /**
   * GET /api/v1/jobs/:id - Get job status
   */
  app.get<{ Params: { id: string }; Reply: JobResponse }>(
    "/jobs/:id",
    async (request, reply) => {
      const { id } = request.params;

      try {
        const job = await jobQueue.getJob(id);

        if (!job) {
          return reply.code(404).send({
            id,
            createdAt: new Date().toISOString(),
            status: "failed",
            error: "Job not found",
          });
        }

        const state = await job.getState();
        const progress = job.progress;

        // Map BullMQ states to our JobStatus
        const statusMap: Record<string, JobStatus> = {
          waiting: "pending",
          active: "active",
          completed: "completed",
          failed: "failed",
          delayed: "pending",
          paused: "pending",
        };

        const status = statusMap[state] || "pending";

        const response: JobResponse = {
          id: job.id!,
          status,
          createdAt: new Date(job.timestamp).toISOString(),
          completedAt: job.finishedOn
            ? new Date(job.finishedOn).toISOString()
            : undefined,
          error: job.failedReason,
        };

        // Add download URL if completed
        if (status === "completed" && job.returnvalue?.artifactPath) {
          // Extract extension from artifact path (.stl or .zip)
          const ext = job.returnvalue.artifactPath.endsWith(".stl") ? ".stl" : ".zip";
          response.downloadUrl = `${request.protocol}://${request.host}/artifacts/${job.id}${ext}`;
        }

        return response;
      } catch (error: any) {
        app.log.error({ error, jobId: id }, "Failed to get job status");
        throw error;
      }
    }
  );

  /**
   * GET /api/v1/jobs/:id/download - Download job artifact
   * Supports both .stl (single socket) and .zip (batch) artifacts
   */
  app.get<{ Params: { id: string } }>(
    "/jobs/:id/download",
    async (request, reply) => {
      const { id } = request.params;

      try {
        // Check for STL file first (single socket result)
        const stlPath = join(config.artifacts.dir, `${id}.stl`);
        try {
          await stat(stlPath);
          return reply.sendFile(`${id}.stl`);
        } catch {
          // STL not found, check for ZIP
        }

        // Check for ZIP file (batch result or legacy)
        const zipPath = join(config.artifacts.dir, `${id}.zip`);
        try {
          await stat(zipPath);
          return reply.sendFile(`${id}.zip`);
        } catch {
          // ZIP not found either
        }

        return reply.code(404).send({
          error: "Artifact not found",
        });
      } catch (error: any) {
        app.log.error({ error, jobId: id }, "Failed to download artifact");
        throw error;
      }
    }
  );

  /**
   * DELETE /api/v1/jobs/:id - Cancel a pending job
   */
  app.delete<{ Params: { id: string } }>(
    "/jobs/:id",
    async (request, reply) => {
      const { id } = request.params;

      try {
        const job = await jobQueue.getJob(id);

        if (!job) {
          return reply.code(404).send({
            error: "Job not found",
          });
        }

        const state = await job.getState();

        if (state === "completed" || state === "failed") {
          return reply.code(400).send({
            error: "Cannot cancel completed or failed job",
          });
        }

        await job.remove();

        app.log.info({ jobId: id }, "Job cancelled");

        return reply.code(204).send();
      } catch (error: any) {
        app.log.error({ error, jobId: id }, "Failed to cancel job");
        throw error;
      }
    }
  );
};
