import { Link } from "react-router";
import { useTheme } from "~/hooks/use-theme";
import { Button } from "~/components/ui/button";
import { Moon, Sun, Wrench } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Wrench className="h-5 w-5 text-primary" />
          <span>SocketSliders</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/generator"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Generator
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
