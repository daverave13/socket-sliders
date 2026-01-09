import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { Header } from "~/components/header";
import { ThemeProvider } from "~/hooks/use-theme";

// Wrapper component for tests
function renderHeader() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Header />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("Header", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders the logo and brand name", () => {
    renderHeader();
    expect(screen.getByText("SocketSliders")).toBeInTheDocument();
  });

  it("has a link to home page", () => {
    renderHeader();
    const homeLink = screen.getByRole("link", { name: /socketsliders/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders theme toggle button", () => {
    renderHeader();
    expect(
      screen.getByRole("button", { name: /switch to dark mode/i })
    ).toBeInTheDocument();
  });

  it("toggles theme when button is clicked", async () => {
    const user = userEvent.setup();
    renderHeader();

    // Initially light mode - button says switch to dark
    const toggleButton = screen.getByRole("button", { name: /switch to dark mode/i });
    await user.click(toggleButton);

    // Now dark mode - button should say switch to light
    expect(
      screen.getByRole("button", { name: /switch to light mode/i })
    ).toBeInTheDocument();
  });

  it("has sticky positioning", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky", "top-0");
  });

  it("has backdrop blur effect", () => {
    renderHeader();
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("backdrop-blur");
  });
});
