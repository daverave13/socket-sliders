import { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Center } from "@react-three/drei";
import * as THREE from "three";
import {
  createVerticalSocketGeometry,
  createHorizontalSocketGeometry,
} from "~/lib/socket-geometry";
import type {
  LabelPosition,
  HorizontalLabelPosition,
} from "@socketSliders/shared";
import labelGeometryData from "~/data/labels.json";

// Type definitions for label geometry data
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

const labelGeometry = labelGeometryData as unknown as LabelGeometryMap;

// Convert label text to geometry key
// "10mm" -> "10mm"
// "3/8" or '3/8"' -> "3_over_8"
function labelTextToKey(labelText: string): string {
  if (!labelText) return "";

  // Metric labels pass through
  if (labelText.endsWith("mm")) {
    return labelText;
  }

  // Imperial fractions: "3/8" or '3/8"' -> "3_over_8"
  const fractionMatch = labelText.match(/^(\d+)\/(\d+)"?$/);
  if (fractionMatch) {
    return `${fractionMatch[1]}_over_${fractionMatch[2]}`;
  }

  return "";
}

export interface SocketPreviewProps {
  orientation: "vertical" | "horizontal";
  socketDiameter: number; // in mm
  socketLength?: number; // in mm, for horizontal only
  labelText: string; // e.g., "10mm" or "3/8\""
  labelPosition?: LabelPosition | HorizontalLabelPosition;
  metric: boolean;
}

// Socket mesh component
function SocketMesh({
  orientation,
  socketDiameter,
  socketLength = 50,
  labelPosition,
  metric,
}: {
  orientation: "vertical" | "horizontal";
  socketDiameter: number;
  socketLength?: number;
  labelPosition?: LabelPosition | HorizontalLabelPosition;
  metric?: boolean;
}) {
  const geometry = useMemo(() => {
    // Clamp values to valid ranges
    const clampedDiameter = Math.max(5, Math.min(28, socketDiameter || 15));
    const clampedLength = Math.max(20, Math.min(67, socketLength || 50));

    if (orientation === "vertical") {
      return createVerticalSocketGeometry({ socketDiameter: clampedDiameter });
    } else {
      if (labelPosition !== "top" && labelPosition !== "bottom") {
        labelPosition = "top";
      }

      return createHorizontalSocketGeometry({
        socketDiameter: clampedDiameter,
        socketLength: clampedLength,
        labelPosition: labelPosition,
      });
    }
  }, [orientation, socketDiameter, socketLength, labelPosition]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={metric ? "#4a90d9" : "#d94a4a"}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// Check if a point is inside a polygon using ray casting
function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    if (
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

// Target height for labels (metric labels are ~7mm, scale imperial to match)
const TARGET_LABEL_HEIGHT = 6;

// DXF-based extruded label component
function DXFLabel({
  labelKey,
  position,
}: {
  labelKey: string;
  position: [number, number, number];
}) {
  const geometry = useMemo(() => {
    const data = labelGeometry[labelKey];
    if (!data || data.paths.length === 0) return null;

    // Separate outer paths from holes
    const outerPaths = data.paths.filter((p) => !p.isHole);
    const holePaths = data.paths.filter((p) => p.isHole);

    if (outerPaths.length === 0) return null;

    // Calculate scale to normalize label height
    const labelScale = TARGET_LABEL_HEIGHT / data.bounds.height;

    // Create shapes from outer paths
    const shapes: THREE.Shape[] = [];

    for (const pathData of outerPaths) {
      const shape = new THREE.Shape();
      const points = pathData.points;

      if (points.length < 3) continue;

      // Scale and move to first point
      shape.moveTo(points[0][0] * labelScale, points[0][1] * labelScale);

      // Draw lines to remaining points (scaled)
      for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i][0] * labelScale, points[i][1] * labelScale);
      }

      // Close the shape
      shape.closePath();

      // Only add holes that are contained within this shape
      for (const holeData of holePaths) {
        // Check if hole centroid is inside this shape
        const holeCentroid: [number, number] = [
          holeData.points.reduce((s, p) => s + p[0], 0) /
            holeData.points.length,
          holeData.points.reduce((s, p) => s + p[1], 0) /
            holeData.points.length,
        ];

        if (!pointInPolygon(holeCentroid, points)) continue;

        const holePath = new THREE.Path();
        const holePoints = holeData.points;

        if (holePoints.length < 3) continue;

        // Scale hole points
        holePath.moveTo(
          holePoints[0][0] * labelScale,
          holePoints[0][1] * labelScale
        );
        for (let i = 1; i < holePoints.length; i++) {
          holePath.lineTo(
            holePoints[i][0] * labelScale,
            holePoints[i][1] * labelScale
          );
        }
        holePath.closePath();

        shape.holes.push(holePath);
      }

      shapes.push(shape);
    }

    if (shapes.length === 0) return null;

    // Create extruded geometry
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.6,
      bevelEnabled: false,
    };

    const geo = new THREE.ExtrudeGeometry(shapes, extrudeSettings);

    // Center the geometry
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox!.getCenter(center);
    geo.translate(-center.x, -center.y, 0);

    return geo;
  }, [labelKey]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial color="#fcfcfc" />
    </mesh>
  );
}

// Text fallback component
function TextLabel({
  text,
  position,
}: {
  text: string;
  position: [number, number, number];
}) {
  return (
    <Text
      position={position}
      fontSize={8}
      color="#fcfcfcff"
      anchorX="center"
      anchorY="middle"
      rotation={[0, 0, 0]}
    >
      {text}
    </Text>
  );
}

// Label component with DXF geometry support and text fallback
function SocketLabel({
  text,
  position,
  orientation,
  socketDiameter,
}: {
  text: string;
  position?: LabelPosition | HorizontalLabelPosition;
  orientation: "vertical" | "horizontal";
  socketDiameter: number;
}) {
  const sliderWidth = socketDiameter + 0.75 + 2;
  const labelKey = labelTextToKey(text);
  const hasGeometry = labelKey && labelGeometry[labelKey];

  // Calculate label position based on orientation and position setting
  const labelPos = useMemo(() => {
    if (orientation === "vertical") {
      const topL = 41.5;
      const H = 13.05;
      const halfWidth = sliderWidth / 2;
      const halfLength = topL / 2;
      // Position mapping for vertical sockets
      // After rotation, X becomes depth, Y becomes length, Z becomes height
      const positions: Record<LabelPosition, [number, number, number]> = {
        topLeft: [-halfWidth + 6, halfLength - 4, H / 2 + 0.3],
        bottomLeft: [-halfWidth + 5, -halfLength + 5, H / 2 + 0.3],
      };

      return positions[(position as LabelPosition) || "topLeft"];
    } else {
      const topL = 83.5;
      const H = 13.05;

      // Horizontal socket label positions (top or bottom)
      if (position === "top") {
        return [0, topL / 2 - 5, H / 2 + 0.3] as [number, number, number];
      } else {
        return [0, -topL / 2 + 5, H / 2 + 0.3] as [number, number, number];
      }
    }
  }, [orientation, position, sliderWidth, text]);

  if (!text) return null;

  // Use DXF geometry if available, otherwise fall back to text
  if (hasGeometry) {
    return <DXFLabel labelKey={labelKey} position={labelPos} />;
  }

  return <TextLabel text={text} position={labelPos} />;
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

export function SocketPreview({
  orientation,
  socketDiameter,
  socketLength,
  labelText,
  labelPosition,
  metric,
}: SocketPreviewProps) {
  // Don't render if we don't have valid diameter
  const hasValidDiameter = socketDiameter && socketDiameter > 0;

  return (
    <div
      className={`w-full ${orientation === "vertical" ? "h-96" : "h-[500px]"} bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden`}
    >
      <Canvas
        camera={{ position: [40, 30, 40], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        <Suspense fallback={<LoadingFallback />}>
          {hasValidDiameter ? (
            <Center>
              <group>
                <SocketMesh
                  orientation={orientation}
                  socketDiameter={socketDiameter}
                  socketLength={socketLength}
                  labelPosition={labelPosition}
                  metric={metric}
                />
                <SocketLabel
                  text={labelText}
                  position={labelPosition}
                  orientation={orientation}
                  socketDiameter={socketDiameter}
                />
              </group>
            </Center>
          ) : (
            <Text
              position={[0, 0, 0]}
              fontSize={3}
              color="#666666"
              anchorX="center"
              anchorY="middle"
            >
              Enter dimensions to preview
            </Text>
          )}
        </Suspense>

        <OrbitControls enablePan={false} minDistance={20} maxDistance={100} />
      </Canvas>
    </div>
  );
}
