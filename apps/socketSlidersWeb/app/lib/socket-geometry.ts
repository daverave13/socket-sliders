import * as THREE from "three";
import { CSG } from "three-csg-ts";

export interface VerticalSocketParams {
  socketDiameter: number; // mm
}

export interface HorizontalSocketParams {
  socketDiameter: number; // mm
  socketLength: number; // mm
  labelPosition: "top" | "bottom";
}

// Vertical socket shape constants (from vertical-socket.scad)
const VERTICAL = {
  H: 13.05,
  topL: 41.5,
  bottomL: 35,
  topLipH: 3.5,
  botLipH: 2.396,
  diagHeight: 4.896,
  neckHalf: 15,
  diagRun: 2.5,
};

// Horizontal socket shape constants (from horizontal-socket.scad)
const HORIZONTAL = {
  H: 13.05,
  topL: 83.5,
  bottomL: 77,
  topLipH: 3.5,
  botLipH: 2.396,
  diagHeight: 4.896,
  neckHalf: 36,
  diagRun: 2.5,
};

/**
 * Create 2D silhouette shape for vertical socket
 * This matches the OpenSCAD silhouette_2d() module
 */
function createVerticalSilhouette(): THREE.Shape {
  const { H, topL, bottomL, topLipH, botLipH, diagHeight, neckHalf, diagRun } =
    VERTICAL;

  const cx = topL / 2;
  const bottomTrim = (topL - bottomL) / 2;

  const shape = new THREE.Shape();

  // Start at top-left and go clockwise
  shape.moveTo(0, H);
  shape.lineTo(topL, H);
  shape.lineTo(topL, H - topLipH);
  shape.lineTo(cx + neckHalf, H - topLipH);
  shape.lineTo(cx + neckHalf, diagHeight);
  shape.lineTo(cx + neckHalf + diagRun, botLipH);
  shape.lineTo(topL - bottomTrim, 0);
  shape.lineTo(bottomTrim, 0);
  shape.lineTo(bottomTrim, botLipH);
  shape.lineTo(cx - neckHalf, diagHeight);
  shape.lineTo(cx - neckHalf, H - topLipH);
  shape.lineTo(0, H - topLipH);
  shape.lineTo(0, H);

  return shape;
}

/**
 * Create 2D silhouette shape for horizontal socket
 */
function createHorizontalSilhouette(): THREE.Shape {
  const { H, topL, bottomL, topLipH, botLipH, diagHeight, neckHalf, diagRun } =
    HORIZONTAL;

  const cx = topL / 2;
  const bottomTrim = (topL - bottomL) / 2;

  const shape = new THREE.Shape();

  shape.moveTo(0, H);
  shape.lineTo(topL, H);
  shape.lineTo(topL, H - topLipH);
  shape.lineTo(cx + neckHalf, H - topLipH);
  shape.lineTo(cx + neckHalf, diagHeight);
  shape.lineTo(cx + neckHalf + diagRun, botLipH);
  shape.lineTo(topL - bottomTrim, 0);
  shape.lineTo(bottomTrim, 0);
  shape.lineTo(bottomTrim, botLipH);
  shape.lineTo(cx - neckHalf, diagHeight);
  shape.lineTo(cx - neckHalf, H - topLipH);
  shape.lineTo(0, H - topLipH);
  shape.lineTo(0, H);

  return shape;
}

/**
 * Create vertical socket geometry
 */
export function createVerticalSocketGeometry(
  params: VerticalSocketParams
): THREE.BufferGeometry {
  const { socketDiameter } = params;
  const holeDiameter = socketDiameter + 0.75;
  const sliderWidth = holeDiameter + 2;

  // Create extruded body
  const silhouette = createVerticalSilhouette();
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: sliderWidth,
    bevelEnabled: false,
  };
  const bodyGeometry = new THREE.ExtrudeGeometry(silhouette, extrudeSettings);

  // Create hole cylinder
  // In OpenSCAD: positioned at (topL/2, H+1, sliderWidth/2), oriented along Y
  const holeGeometry = new THREE.CylinderGeometry(
    holeDiameter / 2,
    holeDiameter / 2,
    VERTICAL.topL * 2, // long enough to cut through
    32
  );

  // Position the hole
  const holeMesh = new THREE.Mesh(holeGeometry);
  holeMesh.position.set(VERTICAL.topL / 2, VERTICAL.H + 1, sliderWidth / 2);
  holeMesh.updateMatrix();

  // Create body mesh for CSG
  const bodyMesh = new THREE.Mesh(bodyGeometry);
  bodyMesh.updateMatrix();

  // Perform boolean subtraction
  const resultMesh = CSG.subtract(bodyMesh, holeMesh);

  // Apply rotation to match OpenSCAD output: rotate([90, 0, 90])
  // This makes Y become Z (height up)
  const finalGeometry = resultMesh.geometry.clone();
  finalGeometry.rotateX(Math.PI / 2);
  finalGeometry.rotateZ(Math.PI / 2);

  // Center the geometry
  finalGeometry.computeBoundingBox();
  const center = new THREE.Vector3();
  finalGeometry.boundingBox!.getCenter(center);
  finalGeometry.translate(-center.x, -center.y, -center.z);

  return finalGeometry;
}

/**
 * Create horizontal socket geometry
 */
export function createHorizontalSocketGeometry(
  params: HorizontalSocketParams
): THREE.BufferGeometry {
  const { socketDiameter, socketLength, labelPosition } = params;
  const holeDiameter = socketDiameter + 0.75;
  const sliderWidth = holeDiameter + 2;
  const holeLength = Math.min(socketLength + 3, 66);

  // Create extruded body
  const silhouette = createHorizontalSilhouette();
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: sliderWidth,
    bevelEnabled: false,
  };
  const bodyGeometry = new THREE.ExtrudeGeometry(silhouette, extrudeSettings);

  // Create hole cylinder
  const holeGeometry = new THREE.CylinderGeometry(
    holeDiameter / 2,
    holeDiameter / 2,
    holeLength,
    32
  );

  // Position the hole - starts at x=6.5 or x=8.5 depending on label position
  // For preview, use default position
  const x0 = labelPosition === "top" ? 8 : 10;
  const holeMesh = new THREE.Mesh(holeGeometry);
  holeMesh.position.set(x0 + holeLength / 2, HORIZONTAL.H + 1, sliderWidth / 2);
  holeMesh.rotation.z = Math.PI / 2; // Orient along X axis
  holeMesh.updateMatrix();

  // Create body mesh for CSG
  const bodyMesh = new THREE.Mesh(bodyGeometry);
  bodyMesh.updateMatrix();

  // Perform boolean subtraction
  const resultMesh = CSG.subtract(bodyMesh, holeMesh);

  // Apply rotation to match OpenSCAD output: rotate([90, 0, 90])
  const finalGeometry = resultMesh.geometry.clone();
  finalGeometry.rotateX(Math.PI / 2);
  finalGeometry.rotateZ(Math.PI / 2);

  // Center the geometry
  finalGeometry.computeBoundingBox();
  const center = new THREE.Vector3();
  finalGeometry.boundingBox!.getCenter(center);
  finalGeometry.translate(-center.x, -center.y, -center.z);

  return finalGeometry;
}

/**
 * Get the top surface height for label positioning
 */
export function getTopSurfaceHeight(
  orientation: "vertical" | "horizontal"
): number {
  return orientation === "vertical" ? VERTICAL.H : HORIZONTAL.H;
}

/**
 * Get the length of the socket body for label positioning
 */
export function getBodyLength(orientation: "vertical" | "horizontal"): number {
  return orientation === "vertical" ? VERTICAL.topL : HORIZONTAL.topL;
}
