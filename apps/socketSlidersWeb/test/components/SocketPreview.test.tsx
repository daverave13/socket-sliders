import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocketPreview } from "~/components/SocketPreview";

// Mock react-three/fiber
vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas-mock">{children}</div>
  ),
}));

// Mock react-three/drei
vi.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls-mock" />,
  Text: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="text-mock" data-position={JSON.stringify(props.position)}>
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
        />
      );
      expect(screen.getByTestId("center-mock")).toBeInTheDocument();
    });
  });

  describe("label rendering", () => {
    it("renders label text when provided", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
        />
      );
      expect(screen.getByText("10mm")).toBeInTheDocument();
    });

    it("renders imperial fraction labels", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="3/8"
        />
      );
      expect(screen.getByText("3/8")).toBeInTheDocument();
    });

    it("does not render label when text is empty", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText=""
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
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("label positions for vertical sockets", () => {
    it("accepts topLeft label position", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          labelPosition="topLeft"
        />
      );
      expect(screen.getByText("10mm")).toBeInTheDocument();
    });

    it("accepts topMid label position", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          labelPosition="topMid"
        />
      );
      expect(screen.getByText("10mm")).toBeInTheDocument();
    });

    it("accepts bottomRight label position", () => {
      render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
          labelPosition="bottomRight"
        />
      );
      expect(screen.getByText("10mm")).toBeInTheDocument();
    });
  });

  describe("label positions for horizontal sockets", () => {
    it("accepts top label position", () => {
      render(
        <SocketPreview
          orientation="horizontal"
          socketDiameter={15}
          socketLength={50}
          labelText="10mm"
          labelPosition="top"
        />
      );
      expect(screen.getByText("10mm")).toBeInTheDocument();
    });

    it("accepts bottom label position", () => {
      render(
        <SocketPreview
          orientation="horizontal"
          socketDiameter={15}
          socketLength={50}
          labelText="10mm"
          labelPosition="bottom"
        />
      );
      expect(screen.getByText("10mm")).toBeInTheDocument();
    });
  });

  describe("container styling", () => {
    it("has rounded corners", () => {
      const { container } = render(
        <SocketPreview
          orientation="vertical"
          socketDiameter={15}
          labelText="10mm"
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
          />
        )
      ).not.toThrow();
    });
  });
});
