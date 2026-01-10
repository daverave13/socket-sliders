import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  createVerticalSocketGeometry,
  createHorizontalSocketGeometry,
} from "~/lib/socket-geometry";
import type { BackgroundSocket } from "~/lib/generateBackgroundSockets";

interface AnimatedSocketMeshProps {
  socket: BackgroundSocket;
  index: number;
}

function AnimatedSocketMesh({ socket, index }: AnimatedSocketMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = socket.position[1];

  const geometry = useMemo(() => {
    if (socket.orientation === "vertical") {
      return createVerticalSocketGeometry({
        socketDiameter: socket.socketDiameter,
      });
    }
    return createHorizontalSocketGeometry({
      socketDiameter: socket.socketDiameter,
      socketLength: socket.socketLength,
      labelPosition: "top",
    });
  }, [socket.orientation, socket.socketDiameter, socket.socketLength]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation (different speeds per socket)
      const rotationSpeed = 0.002 + index * 0.0003;
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x += rotationSpeed * 0.3;

      // Subtle floating effect
      const floatAmplitude = 2;
      const floatSpeed = 0.3 + index * 0.05;
      meshRef.current.position.y =
        initialY + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={socket.position}
      rotation={socket.rotation}
      scale={socket.scale}
    >
      <meshStandardMaterial
        color={socket.metric ? "#4a90d9" : "#d94a4a"}
        transparent
        opacity={0.5}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

interface BackgroundSocketSceneProps {
  sockets: BackgroundSocket[];
}

export function BackgroundSocketScene({ sockets }: BackgroundSocketSceneProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 120], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 50, 50]} intensity={0.8} />
        <directionalLight position={[-50, -50, 30]} intensity={0.3} />

        <Suspense fallback={null}>
          {sockets.map((socket, index) => (
            <AnimatedSocketMesh key={socket.id} socket={socket} index={index} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
