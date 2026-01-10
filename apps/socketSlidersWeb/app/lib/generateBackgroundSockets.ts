export interface BackgroundSocket {
  id: string;
  orientation: "vertical" | "horizontal";
  socketDiameter: number;
  socketLength: number;
  metric: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

// Simple seeded random number generator for consistent results
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Pick a random item from an array
function pick<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

// Generate a random number in a range
function range(min: number, max: number, random: () => number): number {
  return min + random() * (max - min);
}

export function generateBackgroundSockets(
  count: number = 8,
  seed: number = 42
): BackgroundSocket[] {
  const random = seededRandom(seed);
  const sockets: BackgroundSocket[] = [];

  // Common socket diameters (mm)
  const diameters = [8, 10, 12, 14, 17, 19, 21, 24];
  // Socket lengths for horizontal (mm)
  const lengths = [30, 40, 50, 55];

  // Define positions that scatter around the edges, avoiding center
  // These are in 3D world coordinates for Three.js
  const positionZones: Array<{ x: [number, number]; y: [number, number]; z: [number, number] }> = [
    // Top-left area
    { x: [-80, -40], y: [30, 50], z: [-20, 20] },
    // Top-right area
    { x: [40, 80], y: [30, 50], z: [-20, 20] },
    // Bottom-left area
    { x: [-80, -40], y: [-50, -30], z: [-20, 20] },
    // Bottom-right area
    { x: [40, 80], y: [-50, -30], z: [-20, 20] },
    // Far left
    { x: [-100, -60], y: [-20, 20], z: [-30, 10] },
    // Far right
    { x: [60, 100], y: [-20, 20], z: [-30, 10] },
    // Top center (far back)
    { x: [-20, 20], y: [50, 70], z: [-40, -20] },
    // Bottom center (far back)
    { x: [-20, 20], y: [-70, -50], z: [-40, -20] },
  ];

  for (let i = 0; i < count; i++) {
    const zone = positionZones[i % positionZones.length];

    sockets.push({
      id: `bg-socket-${i}`,
      orientation: random() > 0.5 ? "vertical" : "horizontal",
      socketDiameter: pick(diameters, random),
      socketLength: pick(lengths, random),
      metric: random() > 0.3, // 70% metric (blue), 30% imperial (red)
      position: [
        range(zone.x[0], zone.x[1], random),
        range(zone.y[0], zone.y[1], random),
        range(zone.z[0], zone.z[1], random),
      ],
      rotation: [
        range(0, Math.PI * 2, random),
        range(0, Math.PI * 2, random),
        range(0, Math.PI * 2, random),
      ],
      scale: range(0.6, 1.0, random),
    });
  }

  return sockets;
}
