import { describe, it, expect } from "vitest";
import {
  createVerticalSocketGeometry,
  createHorizontalSocketGeometry,
  getTopSurfaceHeight,
  getBodyLength,
} from "~/lib/socket-geometry";

// Helper to check if something is a BufferGeometry-like object
// (avoids instanceof issues with multiple THREE.js instances)
function isBufferGeometry(obj: unknown): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "getAttribute" in obj &&
    "computeBoundingBox" in obj &&
    "attributes" in obj
  );
}

describe("socket-geometry", () => {
  describe("getTopSurfaceHeight", () => {
    it("returns correct height for vertical orientation", () => {
      expect(getTopSurfaceHeight("vertical")).toBe(13.05);
    });

    it("returns correct height for horizontal orientation", () => {
      expect(getTopSurfaceHeight("horizontal")).toBe(13.05);
    });
  });

  describe("getBodyLength", () => {
    it("returns correct length for vertical orientation", () => {
      expect(getBodyLength("vertical")).toBe(41.5);
    });

    it("returns correct length for horizontal orientation", () => {
      expect(getBodyLength("horizontal")).toBe(83.5);
    });
  });

  describe("createVerticalSocketGeometry", () => {
    it("returns a BufferGeometry", () => {
      const geometry = createVerticalSocketGeometry({ socketDiameter: 15 });
      expect(isBufferGeometry(geometry)).toBe(true);
    });

    it("creates geometry with position attribute", () => {
      const geometry = createVerticalSocketGeometry({ socketDiameter: 15 });
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("creates geometry with normal attribute", () => {
      const geometry = createVerticalSocketGeometry({ socketDiameter: 15 });
      expect(geometry.getAttribute("normal")).toBeDefined();
    });

    it("creates geometry with bounding box", () => {
      const geometry = createVerticalSocketGeometry({ socketDiameter: 15 });
      geometry.computeBoundingBox();
      expect(geometry.boundingBox).not.toBeNull();
      // Verify bounding box has min/max properties
      expect(geometry.boundingBox!.min).toBeDefined();
      expect(geometry.boundingBox!.max).toBeDefined();
    });

    it("creates larger geometry for larger socket diameter", () => {
      const smallGeometry = createVerticalSocketGeometry({ socketDiameter: 10 });
      const largeGeometry = createVerticalSocketGeometry({ socketDiameter: 25 });

      smallGeometry.computeBoundingBox();
      largeGeometry.computeBoundingBox();

      // Calculate size from bounding box min/max
      const smallBox = smallGeometry.boundingBox!;
      const largeBox = largeGeometry.boundingBox!;

      const smallVolume =
        (smallBox.max.x - smallBox.min.x) *
        (smallBox.max.y - smallBox.min.y) *
        (smallBox.max.z - smallBox.min.z);
      const largeVolume =
        (largeBox.max.x - largeBox.min.x) *
        (largeBox.max.y - largeBox.min.y) *
        (largeBox.max.z - largeBox.min.z);

      // Larger diameter should produce larger volume
      expect(largeVolume).toBeGreaterThan(smallVolume);
    });

    it("handles minimum socket diameter", () => {
      const geometry = createVerticalSocketGeometry({ socketDiameter: 5 });
      expect(isBufferGeometry(geometry)).toBe(true);
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("handles maximum socket diameter", () => {
      const geometry = createVerticalSocketGeometry({ socketDiameter: 28 });
      expect(isBufferGeometry(geometry)).toBe(true);
      expect(geometry.getAttribute("position")).toBeDefined();
    });
  });

  describe("createHorizontalSocketGeometry", () => {
    it("returns a BufferGeometry", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "top",
      });
      expect(isBufferGeometry(geometry)).toBe(true);
    });

    it("creates geometry with position attribute", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "top",
      });
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("creates geometry with normal attribute", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "bottom",
      });
      expect(geometry.getAttribute("normal")).toBeDefined();
    });

    it("creates geometry with bounding box", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "top",
      });
      geometry.computeBoundingBox();
      expect(geometry.boundingBox).not.toBeNull();
      expect(geometry.boundingBox!.min).toBeDefined();
      expect(geometry.boundingBox!.max).toBeDefined();
    });

    it("creates larger geometry for larger socket diameter", () => {
      const smallGeometry = createHorizontalSocketGeometry({
        socketDiameter: 10,
        socketLength: 50,
        labelPosition: "top",
      });
      const largeGeometry = createHorizontalSocketGeometry({
        socketDiameter: 25,
        socketLength: 50,
        labelPosition: "top",
      });

      smallGeometry.computeBoundingBox();
      largeGeometry.computeBoundingBox();

      const smallBox = smallGeometry.boundingBox!;
      const largeBox = largeGeometry.boundingBox!;

      const smallVolume =
        (smallBox.max.x - smallBox.min.x) *
        (smallBox.max.y - smallBox.min.y) *
        (smallBox.max.z - smallBox.min.z);
      const largeVolume =
        (largeBox.max.x - largeBox.min.x) *
        (largeBox.max.y - largeBox.min.y) *
        (largeBox.max.z - largeBox.min.z);

      expect(largeVolume).toBeGreaterThan(smallVolume);
    });

    it("handles top label position", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "top",
      });
      expect(isBufferGeometry(geometry)).toBe(true);
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("handles bottom label position", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "bottom",
      });
      expect(isBufferGeometry(geometry)).toBe(true);
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("handles minimum socket length", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 20,
        labelPosition: "top",
      });
      expect(isBufferGeometry(geometry)).toBe(true);
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("handles maximum socket length (clamped at 66)", () => {
      const geometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 100, // Should be clamped
        labelPosition: "top",
      });
      expect(isBufferGeometry(geometry)).toBe(true);
      expect(geometry.getAttribute("position")).toBeDefined();
    });

    it("produces geometries for different label positions", () => {
      // Both should produce valid geometries
      const topGeometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "top",
      });
      const bottomGeometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "bottom",
      });

      // Both should be valid geometries with position attributes
      expect(isBufferGeometry(topGeometry)).toBe(true);
      expect(isBufferGeometry(bottomGeometry)).toBe(true);
      expect(topGeometry.getAttribute("position")).toBeDefined();
      expect(bottomGeometry.getAttribute("position")).toBeDefined();
    });
  });

  describe("geometry dimensions", () => {
    it("horizontal socket is longer than vertical socket", () => {
      const verticalGeometry = createVerticalSocketGeometry({ socketDiameter: 15 });
      const horizontalGeometry = createHorizontalSocketGeometry({
        socketDiameter: 15,
        socketLength: 50,
        labelPosition: "top",
      });

      verticalGeometry.computeBoundingBox();
      horizontalGeometry.computeBoundingBox();

      const verticalBox = verticalGeometry.boundingBox!;
      const horizontalBox = horizontalGeometry.boundingBox!;

      // Calculate dimensions from bounding box
      const verticalDims = {
        x: verticalBox.max.x - verticalBox.min.x,
        y: verticalBox.max.y - verticalBox.min.y,
        z: verticalBox.max.z - verticalBox.min.z,
      };
      const horizontalDims = {
        x: horizontalBox.max.x - horizontalBox.min.x,
        y: horizontalBox.max.y - horizontalBox.min.y,
        z: horizontalBox.max.z - horizontalBox.min.z,
      };

      // The max dimension of horizontal should be larger
      const verticalMaxDim = Math.max(verticalDims.x, verticalDims.y, verticalDims.z);
      const horizontalMaxDim = Math.max(
        horizontalDims.x,
        horizontalDims.y,
        horizontalDims.z
      );
      expect(horizontalMaxDim).toBeGreaterThan(verticalMaxDim);
    });
  });
});
