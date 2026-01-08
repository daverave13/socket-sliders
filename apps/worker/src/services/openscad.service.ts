import { mkdir, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import archiver from "archiver";
import { createWriteStream } from "fs";
import { stat } from "fs/promises";
import {
  type SocketConfig,
  toMillimeters,
  formatNominalLabel,
} from "@socketsliders/shared";
import { config } from "../config.js";
import { logger } from "../logger.js";

const execAsync = promisify(exec);

export class OpenSCADService {
  /**
   * Process a socket job: generate SCAD, execute OpenSCAD, create ZIP
   */
  async processJob(jobId: string, socketConfig: SocketConfig): Promise<string> {
    const workspaceDir = join(config.openscad.workspaceDir, jobId);

    try {
      // Create isolated workspace
      await mkdir(workspaceDir, { recursive: true });
      logger.info({ jobId, workspaceDir }, "Created workspace");

      // Execute OpenSCAD directly with -D parameters
      const stlFile = await this.executeOpenSCAD(workspaceDir, socketConfig, jobId);
      logger.info({ jobId, stlFile }, "OpenSCAD execution completed");

      // Validate STL output
      await this.validateSTL(stlFile);
      logger.info({ jobId, stlFile }, "STL validation passed");

      // Create ZIP archive
      const zipPath = await this.createZipArchive(jobId, stlFile, socketConfig);
      logger.info({ jobId, zipPath }, "ZIP archive created");

      // Move to artifacts directory
      const artifactPath = await this.moveToArtifacts(zipPath, jobId);
      logger.info({ jobId, artifactPath }, "Artifact stored");

      return artifactPath;
    } finally {
      // Cleanup workspace
      await rm(workspaceDir, { recursive: true, force: true });
      logger.info({ jobId }, "Workspace cleaned up");
    }
  }

  /**
   * Build OpenSCAD -D parameter flags based on socket config
   */
  private buildOpenSCADParams(socketConfig: SocketConfig): string[] {
    const params: string[] = [];

    // Convert measurements to millimeters
    const outerDiameterMm = toMillimeters(socketConfig.outerDiameter);
    params.push(`-D`, `socketDiameter=${outerDiameterMm.toFixed(3)}`);

    // Add length for horizontal sockets
    if (socketConfig.orientation === "horizontal" && socketConfig.length) {
      const lengthMm = toMillimeters(socketConfig.length);
      params.push(`-D`, `socketLength=${lengthMm.toFixed(3)}`);
    }

    // Add label parameters - must explicitly set unused ones to undef
    if (socketConfig.isMetric) {
      params.push(`-D`, `labelMetric=${socketConfig.nominalMetric}`);
      params.push(`-D`, `labelNumerator=undef`);
      params.push(`-D`, `labelDenominator=undef`);
    } else {
      params.push(`-D`, `labelMetric=undef`);
      params.push(`-D`, `labelNumerator=${socketConfig.nominalNumerator}`);
      params.push(`-D`, `labelDenominator=${socketConfig.nominalDenominator}`);
    }

    // Add label position for vertical sockets
    if (socketConfig.orientation === "vertical" && socketConfig.labelPosition) {
      params.push(`-D`, `labelPosition=\\"${socketConfig.labelPosition}\\"`);
    }

    return params;
  }

  /**
   * Execute OpenSCAD CLI to generate STL
   */
  private async executeOpenSCAD(
    workspaceDir: string,
    socketConfig: SocketConfig,
    jobId: string
  ): Promise<string> {
    const stlFile = join(workspaceDir, `${jobId}.stl`);
    const templateName = `${socketConfig.orientation}-socket.scad`;
    const templatePath = join(config.openscad.templatesDir, templateName);

    // Build -D parameter flags
    const paramFlags = this.buildOpenSCADParams(socketConfig);

    const command = [
      config.openscad.executable,
      ...paramFlags,
      "-o",
      stlFile,
      templatePath,
    ].join(" ");

    logger.debug({ command }, "Executing OpenSCAD");

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: config.worker.jobTimeout,
        // Run from templates dir so relative paths (e.g., ./labels/) work
        cwd: config.openscad.templatesDir,
      });

      if (stdout) {
        logger.debug({ stdout }, "OpenSCAD stdout");
      }
      if (stderr) {
        logger.warn({ stderr }, "OpenSCAD stderr");
      }

      return stlFile;
    } catch (error: any) {
      logger.error(
        { error, stderr: error.stderr },
        "OpenSCAD execution failed"
      );
      throw new Error(`OpenSCAD execution failed: ${error.message}`);
    }
  }

  /**
   * Validate STL file exists and has content
   */
  private async validateSTL(stlFile: string): Promise<void> {
    try {
      const stats = await stat(stlFile);

      if (!stats.isFile()) {
        throw new Error("STL output is not a file");
      }

      if (stats.size === 0) {
        throw new Error("STL output is empty");
      }

      // Minimum realistic STL size (header + minimal geometry)
      if (stats.size < 100) {
        throw new Error("STL output is suspiciously small");
      }

      logger.debug({ stlFile, size: stats.size }, "STL validation passed");
    } catch (error: any) {
      logger.error({ error, stlFile }, "STL validation failed");
      throw new Error(`STL validation failed: ${error.message}`);
    }
  }

  /**
   * Create ZIP archive with STL and metadata
   */
  private async createZipArchive(
    jobId: string,
    stlFile: string,
    socketConfig: SocketConfig
  ): Promise<string> {
    const zipPath = join(config.openscad.workspaceDir, jobId, `${jobId}.zip`);
    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on("close", () => {
        logger.debug({ zipPath, size: archive.pointer() }, "ZIP created");
        resolve(zipPath);
      });

      archive.on("error", (err) => {
        logger.error({ err }, "ZIP creation failed");
        reject(err);
      });

      archive.pipe(output);

      // Add STL file with descriptive name
      const stlFilename = `socket-${
        socketConfig.orientation
      }-${formatNominalLabel(socketConfig).replace(/[^a-zA-Z0-9]/g, "_")}.stl`;
      archive.file(stlFile, { name: stlFilename });

      // Add metadata JSON
      const metadata = {
        jobId,
        generatedAt: new Date().toISOString(),
        socketConfig,
        generator: "SocketSliders v1.0",
      };
      archive.append(JSON.stringify(metadata, null, 2), {
        name: "metadata.json",
      });

      archive.finalize();
    });
  }

  /**
   * Move ZIP to artifacts directory
   */
  private async moveToArtifacts(
    zipPath: string,
    jobId: string
  ): Promise<string> {
    await mkdir(config.openscad.artifactsDir, { recursive: true });

    const artifactPath = join(config.openscad.artifactsDir, `${jobId}.zip`);

    // Read and write to move across potential mount boundaries
    const zipData = await readFile(zipPath);
    await writeFile(artifactPath, zipData);

    return artifactPath;
  }
}
