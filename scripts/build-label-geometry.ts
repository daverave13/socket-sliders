/**
 * Build script to parse DXF label files and generate JSON geometry data
 * for use in the SocketPreview component.
 *
 * Usage: npx tsx scripts/build-label-geometry.ts
 */

import * as fs from "fs";
import * as path from "path";
import DxfParser from "dxf-parser";

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
}

interface LabelPath {
  points: [number, number][];
  isHole: boolean;
}

interface LabelGeometry {
  paths: LabelPath[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

interface LabelGeometryMap {
  [key: string]: LabelGeometry;
}

const EPSILON = 0.001; // Tolerance for point matching

function pointsEqual(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < EPSILON && Math.abs(a.y - b.y) < EPSILON;
}

function pointKey(p: Point): string {
  // Round to 3 decimal places for consistent keys
  return `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
}

/**
 * Extract LINE entities from parsed DXF
 */
function extractLines(dxf: ReturnType<DxfParser["parseSync"]>): Line[] {
  const lines: Line[] = [];

  if (!dxf?.entities) return lines;

  for (const entity of dxf.entities) {
    if (entity.type === "LINE") {
      const lineEntity = entity as {
        type: "LINE";
        vertices: { x: number; y: number }[];
      };
      if (lineEntity.vertices && lineEntity.vertices.length >= 2) {
        lines.push({
          start: { x: lineEntity.vertices[0].x, y: lineEntity.vertices[0].y },
          end: { x: lineEntity.vertices[1].x, y: lineEntity.vertices[1].y },
        });
      }
    }
  }

  return lines;
}

/**
 * Build adjacency map for lines
 */
function buildAdjacency(lines: Line[]): Map<string, Line[]> {
  const adjacency = new Map<string, Line[]>();

  for (const line of lines) {
    const startKey = pointKey(line.start);
    const endKey = pointKey(line.end);

    if (!adjacency.has(startKey)) adjacency.set(startKey, []);
    if (!adjacency.has(endKey)) adjacency.set(endKey, []);

    adjacency.get(startKey)!.push(line);
    adjacency.get(endKey)!.push(line);
  }

  return adjacency;
}

/**
 * Trace closed paths from connected lines
 */
function traceClosedPaths(lines: Line[]): Point[][] {
  const paths: Point[][] = [];
  const usedLines = new Set<Line>();
  const adjacency = buildAdjacency(lines);

  for (const startLine of lines) {
    if (usedLines.has(startLine)) continue;

    // Start a new path
    const path: Point[] = [startLine.start, startLine.end];
    usedLines.add(startLine);

    let currentPoint = startLine.end;
    let foundNext = true;

    while (foundNext && !pointsEqual(currentPoint, path[0])) {
      foundNext = false;
      const key = pointKey(currentPoint);
      const connectedLines = adjacency.get(key) || [];

      for (const line of connectedLines) {
        if (usedLines.has(line)) continue;

        let nextPoint: Point | null = null;

        if (pointsEqual(line.start, currentPoint)) {
          nextPoint = line.end;
        } else if (pointsEqual(line.end, currentPoint)) {
          nextPoint = line.start;
        }

        if (nextPoint) {
          path.push(nextPoint);
          usedLines.add(line);
          currentPoint = nextPoint;
          foundNext = true;
          break;
        }
      }
    }

    // Only add closed paths (first and last point should be the same or very close)
    if (path.length >= 3 && pointsEqual(path[0], path[path.length - 1])) {
      // Remove the duplicate closing point
      path.pop();
      paths.push(path);
    }
  }

  return paths;
}

/**
 * Calculate signed area of a polygon (positive = counter-clockwise, negative = clockwise)
 */
function signedArea(points: Point[]): number {
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return area / 2;
}

/**
 * Check if point is inside polygon using ray casting
 */
function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    if (
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Determine which paths are holes (contained within other paths)
 */
function identifyHoles(paths: Point[][]): LabelPath[] {
  const result: LabelPath[] = [];

  // Sort paths by area (larger paths first)
  const pathsWithArea = paths.map((p) => ({
    points: p,
    area: Math.abs(signedArea(p)),
  }));
  pathsWithArea.sort((a, b) => b.area - a.area);

  for (let i = 0; i < pathsWithArea.length; i++) {
    const current = pathsWithArea[i];
    let isHole = false;

    // Check if this path is inside any larger path
    for (let j = 0; j < i; j++) {
      const larger = pathsWithArea[j];
      // Use centroid of current path to test containment
      const centroid = {
        x: current.points.reduce((s, p) => s + p.x, 0) / current.points.length,
        y: current.points.reduce((s, p) => s + p.y, 0) / current.points.length,
      };

      if (pointInPolygon(centroid, larger.points)) {
        isHole = true;
        break;
      }
    }

    result.push({
      points: current.points.map((p) => [p.x, p.y] as [number, number]),
      isHole,
    });
  }

  return result;
}

/**
 * Calculate bounding box
 */
function calculateBounds(paths: LabelPath[]): LabelGeometry["bounds"] {
  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  for (const path of paths) {
    for (const [x, y] of path.points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Parse a DXF file and extract label geometry
 */
function parseDxfFile(filePath: string): LabelGeometry | null {
  const content = fs.readFileSync(filePath, "utf-8");
  const parser = new DxfParser();

  try {
    const dxf = parser.parseSync(content);
    if (!dxf) return null;

    const lines = extractLines(dxf);
    if (lines.length === 0) return null;

    const rawPaths = traceClosedPaths(lines);
    if (rawPaths.length === 0) return null;

    const paths = identifyHoles(rawPaths);
    const bounds = calculateBounds(paths);

    return { paths, bounds };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Convert filename to label key
 * e.g., "10mm_bold.dxf" -> "10mm"
 *       "3_over_8_bold.dxf" -> "3_over_8"
 */
function filenameToKey(filename: string): string {
  return filename.replace(/_bold\.dxf$/, "");
}

/**
 * Main function
 */
function main() {
  const templatesDir = path.join(__dirname, "..", "templates", "labels");
  const outputDir = path.join(
    __dirname,
    "..",
    "apps",
    "socketSlidersWeb",
    "app",
    "data"
  );
  const outputFile = path.join(outputDir, "labels.json");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all DXF files
  const dxfFiles = fs
    .readdirSync(templatesDir)
    .filter((f) => f.endsWith(".dxf"));

  console.log(`Found ${dxfFiles.length} DXF files`);

  const result: LabelGeometryMap = {};

  for (const file of dxfFiles) {
    const filePath = path.join(templatesDir, file);
    const key = filenameToKey(file);

    console.log(`Processing ${file} -> ${key}`);

    const geometry = parseDxfFile(filePath);
    if (geometry) {
      result[key] = geometry;
      console.log(
        `  ${geometry.paths.length} paths, bounds: ${geometry.bounds.width.toFixed(2)} x ${geometry.bounds.height.toFixed(2)}`
      );
    } else {
      console.warn(`  Failed to parse`);
    }
  }

  // Write output
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`\nWritten to ${outputFile}`);
  console.log(`Total labels: ${Object.keys(result).length}`);
}

main();
