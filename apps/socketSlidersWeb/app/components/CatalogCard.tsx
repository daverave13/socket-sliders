import { useMemo, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Download, Box } from "lucide-react";
import type { CatalogItem } from "~/lib/catalog-data";

function STLPreview({ stlPath }: { stlPath: string }) {
  const geometry = useLoader(STLLoader, stlPath);

  const centeredGeometry = useMemo(() => {
    const geo = geometry.clone();
    geo.computeBoundingBox();
    const center = new THREE.Vector3();
    geo.boundingBox!.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
    return geo;
  }, [geometry]);

  return (
    <mesh geometry={centeredGeometry}>
      <meshStandardMaterial color="#d27474ff" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

interface CatalogCardProps {
  item: CatalogItem;
}

export function CatalogCard({ item }: CatalogCardProps) {
  return (
    <Card className="bg-card/90 backdrop-blur-sm overflow-hidden flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Box className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              {item.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col flex-1">
        {/* 3D Preview */}
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          <Canvas
            camera={{ position: [80, 60, 80], fov: 50 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />

            <Suspense fallback={<LoadingFallback />}>
              <STLPreview stlPath={item.stlPath} />
            </Suspense>

            <OrbitControls
              enablePan={false}
              minDistance={30}
              maxDistance={200}
            />
          </Canvas>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mt-4 flex-1">{item.description}</p>

        {/* Download Button */}
        <Button asChild className="w-full mt-4">
          <a href={item.downloadUrl} download>
            <Download className="mr-2 h-4 w-4" />
            Download STL
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
