import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocketPreview } from "~/components/SocketPreview";

// Mock label geometry JSON
vi.mock("~/data/labels.json", () => ({
  default: {
    "10mm": {
      paths: [{ points: [[0, 0], [1, 0], [1, 1], [0, 1]], isHole: false }],
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 },
    },
    "3_over_8": {
      paths: [{ points: [[0, 0], [1, 0], [1, 1], [0, 1]], isHole: false }],
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 },
    },
  },
}));

// Mock react-three/fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
}));

// Mock react-three/drei
vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock" />,
  Text: ({ children, position }: { children: React.ReactNode; position?: number[] }) => (
    <div data-testid="text-mock" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Center: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="center-mock">{children}</div>
  ),
}));

// Mock socket-geometry functions
vi.mock("~/lib/socket-geometry", () => ({
  createVerticalSocketGeometry: vi.fn(() => ({
    attributes: { position: { count: 100 } },
  })),
  createHorizontalSocketGeometry: vi.fn(() => ({
    attributes: { position: { count: 100 } },
  })),
}));

describe("SocketPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the canvas container", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      expect(screen.getByTestId("canvas-mock")).toBeInTheDocument();
    });

    it("applies correct height class for vertical orientation", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("h-96");
    });

    it("applies correct height class for horizontal orientation", () => {
      const { container } = render(
        <SocketPreview
          orientation="horizontal"
          socketDiameter={15}
          socketLength={50}
          labelText="10mm"
          metric={true}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("h-[500px]");
    });

    it("shows placeholder text when socketDiameter is 0", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={0}
          labelText="10mm"
          metric={true}
        />
      );
      expect(screen.getByText("Enter dimensions to preview")).toBeInTheDocument();
    });

    it("shows placeholder text when socketDiameter is not provided", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={0}
          labelText=""
          metric={true}
        />
      );
      expect(screen.getByText("Enter dimensions to preview")).toBeInTheDocument();
    });

    it("does not show placeholder when valid diameter is provided", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      expect(screen.queryByText("Enter dimensions to preview")).not.toBeInTheDocument();
    });

    it("renders Center wrapper when valid diameter is provided", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      expect(screen.getByTestId("center-mock")).toBeInTheDocument();
    });
  });

  describe("label rendering", () => {
    it("renders DXF geometry label when geometry exists", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      // DXF geometry renders as mesh, not text
      const meshElements = container.querySelectorAll("mesh");
      // Should have at least 2 meshes (socket body + label)
      expect(meshElements.length).toBeGreaterThanOrEqual(2);
    });

    it("renders imperial fraction labels with DXF geometry", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="3/8"
          metric={false}
        />
      );
      // DXF geometry renders as mesh
      const meshElements = container.querySelectorAll("mesh");
      expect(meshElements.length).toBeGreaterThanOrEqual(2);
    });

    it("renders text fallback for unknown labels", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="unknown"
          metric={true}
        />
      );
      // Unknown labels fall back to text
      expect(screen.getByText("unknown")).toBeInTheDocument();
    });

    it("does not render label when text is empty", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText=""
          metric={true}
        />
      );
      // The Text mock should not be rendered if labelText is empty
      const textElements = screen.queryAllByTestId("text-mock");
      // There might be one for placeholder, but not for label
      expect(textElements.filter(el => el.textContent === "")).toHaveLength(0);
    });
  });

  describe("orientation handling", () => {
    it("handles vertical orientation", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles horizontal orientation", () => {
      const { container } = render(
        <SocketPreview
          orientation="horizontal"
          socketDiameter={15}
          socketLength={50}
          labelText="10mm"
          metric={true}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("label positions for vertical sockets", () => {
    it("accepts topLeft label position", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          labelPosition="topLeft"
          metric={true}
        />
      );
      // DXF label renders as mesh with position attribute
      const meshElements = container.querySelectorAll("mesh");
      expect(meshElements.length).toBeGreaterThanOrEqual(2);
    });

    it("accepts bottomLeft label position", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          labelPosition="bottomLeft"
          metric={true}
        />
      );
      const meshElements = container.querySelectorAll("mesh");
      expect(meshElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("label positions for horizontal sockets", () => {
    it("accepts top label position", () => {
      const { container } = render(
        <SocketPreview
          orientation="horizontal"
          socketDiameter={15}
          socketLength={50}
          labelText="10mm"
          labelPosition="top"
          metric={true}
        />
      );
      const meshElements = container.querySelectorAll("mesh");
      expect(meshElements.length).toBeGreaterThanOrEqual(2);
    });

    it("accepts bottom label position", () => {
      const { container } = render(
        <SocketPreview
          orientation="horizontal"
          socketDiameter={15}
          socketLength={50}
          labelText="10mm"
          labelPosition="bottom"
          metric={true}
        />
      );
      const meshElements = container.querySelectorAll("mesh");
      expect(meshElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("container styling", () => {
    it("has rounded corners", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("rounded-lg");
    });

    it("has full width", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("w-full");
    });

    it("hides overflow", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("overflow-hidden");
    });

    it("has background styling for light and dark modes", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          metric={true}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("bg-slate-100");
      expect(wrapper.className).toContain("dark:bg-slate-800");
    });
  });

  describe("prop handling", () => {
    it("handles missing socketLength for horizontal (uses default)", () => {
      // Should not throw
      expect(() =>
        render(
          <SocketPreview
            orientation="horizontal"
            socketDiameter={15}
            labelText="10mm"
            metric={true}
          />
        )
      ).not.toThrow();
    });

    it("handles missing labelPosition (uses default)", () => {
      // Should not throw
      expect(() =>
        render(
          <SocketPreview
            orientation="vertical"
            socketDiameter={15}
            labelText="10mm"
            metric={true}
          />
        )
      ).not.toThrow();
    });
  });
});
