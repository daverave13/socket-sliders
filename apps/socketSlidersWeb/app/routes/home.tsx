import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Wrench, ArrowRight, Check } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SocketSliders - 3D Printable Socket Holders" },
    {
      name: "description",
      content: "Generate custom 3D printable socket holders",
    },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Wrench className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-5xl font-bold text-foreground mb-4">
          SocketSliders
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Generate custom 3D printable socket holders for your workshop.
          Parametric designs for metric and imperial sockets, vertical or
          horizontal orientations.
        </p>

        <Card className="mb-8 text-left">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                "Vertical and horizontal socket holder designs",
                "Support for metric and imperial measurements",
                "Parametric OpenSCAD generation",
                "Custom labels embossed on holders",
                "Download ready-to-print STL files",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="h-12 px-8 text-base">
          <Link to="/generators">
            Generate Socket Holder
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
