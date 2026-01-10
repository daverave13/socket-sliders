import { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Center } from "@react-three/drei";
import {
  createVerticalSocketGeometry,
  createHorizontalSocketGeometry,
} from "~/lib/socket-geometry";
import type {
  LabelPosition,
  HorizontalLabelPosition,
} from "@socketSliders/shared";

export interface SocketPreviewProps {
  orientation: "vertical" | "horizontal";
  socketDiameter: number; // in mm
  socketLength?: number; // in mm, for horizontal only
  labelText: string; // e.g., "10mm" or "3/8\""
  labelPosition?: LabelPosition | HorizontalLabelPosition;
}

// Socket mesh component
function SocketMesh({
  orientation,
  socketDiameter,
  socketLength = 50,
  labelPosition,
  metric = true,
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

// Label component
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
        topLeft: [-halfWidth + 5, halfLength - 4, H / 2 + 0.3],
        topMid: [0, halfLength - 4, H / 2 + 0.3],
        topRight: [halfWidth - 6, halfLength - 4, H / 2 + 0.3],
        bottomLeft: [-halfWidth + 5, -halfLength + 5, H / 2 + 0.3],
        bottomMid: [0, -halfLength + 5, H / 2 + 0.3],
        bottomRight: [halfWidth - 6, -halfLength + 5, H / 2 + 0.3],
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
  }, [orientation, position, sliderWidth]);

  if (!text) return null;

  return (
    <Text
      position={labelPos}
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
