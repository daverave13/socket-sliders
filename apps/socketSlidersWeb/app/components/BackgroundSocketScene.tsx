import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
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
        initialY +
        Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
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
        opacity={0.9}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

interface AnimatedSTLMeshProps {
  stlPath: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  index: number;
}

function AnimatedSTLMesh({
  stlPath,
  position,
  rotation,
  scale,
  index,
}: AnimatedSTLMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useLoader(STLLoader, stlPath);
  const initialY = position[1];

  // Center the geometry
  const centeredGeometry = useMemo(() => {
    const geo = geometry.clone();
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox!.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    return geo;
  }, [geometry]);

  useFrame((state) => {
    if (meshRef.current) {
      // Slow rotation (different speeds per mesh)
      const rotationSpeed = 0.002 + index * 0.0003;
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x += rotationSpeed * 0.3;

      // Subtle floating effect
      const floatAmplitude = 2;
      const floatSpeed = 0.3 + index * 0.05;
      meshRef.current.position.y =
        initialY +
        Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={centeredGeometry}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshStandardMaterial
        color="gray"
        transparent
        opacity={1}
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
  // Only render 6 sockets, replace 2 with STL rails
  const socketsToRender = sockets.slice(0, 6);

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
          {socketsToRender.map((socket, index) => (
            <AnimatedSocketMesh key={socket.id} socket={socket} index={index} />
          ))}

          {/* Rail 1x4 */}
          <AnimatedSTLMesh
            stlPath="/STL/gridfinity - rail 1x4.stl"
            position={[-120, 40, -15]}
            rotation={[0.4, 0.8, 0.2]}
            scale={0.5}
            index={6}
          />

          {/* Rail 1x2 */}
          <AnimatedSTLMesh
            stlPath="/STL/gridfinity - rail 1x2.stl"
            position={[70, -35, -10]}
            rotation={[0.3, -0.5, 0.1]}
            scale={0.5}
            index={7}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
