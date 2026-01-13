import { useMemo } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Ruler,
  RotateCcw,
  Layers,
  ArrowRight,
  Wrench,
  Eye,
  Download,
  FolderOpen,
} from "lucide-react";
import { BackgroundSocketScene } from "~/components/BackgroundSocketScene";
import { generateBackgroundSockets } from "~/lib/generateBackgroundSockets";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SocketSliders - 3D Printable Socket Holders" },
    {
      name: "description",
      content:
        "Generate custom parametric 3D printable socket holders for your workshop. Supports metric and imperial measurements, vertical and horizontal orientations.",
    },
  ];
}

export default function Home() {
  const backgroundSockets = useMemo(() => generateBackgroundSockets(8), []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900" />

      {/* 3D Background layer */}
      <BackgroundSocketScene sockets={backgroundSockets} />

      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/40" />

      {/* Main content layer */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Wrench className="w-4 h-4 mr-2" />
            Gridfinity Compatible
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Custom 3D Printable
            <br />
            <span className="text-primary">Socket Organizers</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate parametric OpenSCAD socket holders for your workshop.
            Design vertical or horizontal holders with live 3D preview,
            supporting both metric and imperial measurements.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-10 text-lg">
              <Link to="/generators">
                Start Generating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg">
              <Link to="/catalog">
                <FolderOpen className="mr-2 h-5 w-5" />
                Browse Catalog
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16 w-full opacity-0 animate-fade-in-up animate-delay-100"
          style={{ animationFillMode: "forwards" }}
        >
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Ruler className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Precise Measurements</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Support for both metric (mm) and imperial (inches) socket sizes
              with parametric precision. Custom labels are embossed directly on
              holders.
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <RotateCcw className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Two Orientations</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Choose vertical holders for upright storage or horizontal holders
              for drawer-friendly layouts. Each design is optimized for its use
              case.
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <Layers className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Batch Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Generate multiple socket holders at once. Download individual STL
              files or a complete ZIP archive ready for your slicer.
            </CardContent>
          </Card>
        </section>

        {/* How It Works Section */}
        <section
          className="max-w-4xl mx-auto text-center mb-16 w-full opacity-0 animate-fade-in-up animate-delay-200"
          style={{ animationFillMode: "forwards" }}
        >
          <h2 className="text-3xl font-bold mb-10">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Configure</h3>
              <p className="text-muted-foreground">
                Enter your socket dimensions, choose orientation, and set your
                preferred measurement system.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Preview</h3>
              <p className="text-muted-foreground">
                See your design in real-time with an interactive 3D preview
                before generating files.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Download</h3>
              <p className="text-muted-foreground">
                Download print-ready STL files and send them straight to your 3D
                printer slicer.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="text-center opacity-0 animate-fade-in-up animate-delay-300"
          style={{ animationFillMode: "forwards" }}
        >
          <p className="text-muted-foreground">
            No installation required. Works entirely in your browser.
          </p>
        </section>
      </div>
    </div>
  );
}
