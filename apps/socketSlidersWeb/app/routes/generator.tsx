import type { Route } from "./+types/generator";
import { useState, useEffect } from "react";
import type {
  SocketConfig,
  JobResponse,
  MeasurementUnit,
  SocketOrientation,
  LabelPosition,
} from "@socketSliders/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Wrench, Download, Loader2, AlertCircle } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Socket Generator - SocketSliders" },
    {
      name: "description",
      content: "Generate custom 3D printable socket holders",
    },
  ];
}

export default function Generator() {
  const [orientation, setOrientation] = useState<SocketOrientation>("vertical");
  const [isMetric, setIsMetric] = useState(true);
  const [nominalMetric, setNominalMetric] = useState("");
  const [nominalNumerator, setNominalNumerator] = useState("");
  const [nominalDenominator, setNominalDenominator] = useState("");
  const [outerDiameter, setOuterDiameter] = useState("");
  const [outerDiameterUnit, setOuterDiameterUnit] = useState<MeasurementUnit>("mm");
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState<MeasurementUnit>("mm");
  const [labelPosition, setLabelPosition] = useState<LabelPosition>("topLeft");

  const [submitting, setSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/v1/jobs/${jobId}`
        );
        const data: JobResponse = await response.json();
        setJobStatus(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Failed to fetch job status:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Build socket config
      const socketConfig: SocketConfig = {
        orientation,
        isMetric,
        ...(isMetric
          ? { nominalMetric: parseInt(nominalMetric) }
          : {
              nominalNumerator: parseInt(nominalNumerator),
              nominalDenominator: parseInt(nominalDenominator),
            }),
        outerDiameter: {
          value: parseFloat(outerDiameter),
          unit: outerDiameterUnit,
        },
        ...(orientation === "horizontal"
          ? {
              length: {
                value: parseFloat(length),
                unit: lengthUnit,
              },
            }
          : { labelPosition }),
      } as SocketConfig;

      // Submit job
      const response = await fetch("http://localhost:3000/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socketConfig }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit job");
      }

      const job: JobResponse = await response.json();
      setJobId(job.id);
      setJobStatus(job);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setJobId(null);
    setJobStatus(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Socket Holder Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Create custom 3D printable socket holders for your workshop
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Configure Your Socket</CardTitle>
            <CardDescription>
              Fill in the details below to generate a custom STL file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Orientation */}
              <div className="space-y-3">
                <Label className="text-base">Orientation</Label>
                <RadioGroup
                  value={orientation}
                  onValueChange={(value) => setOrientation(value as SocketOrientation)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vertical" id="vertical" />
                    <Label htmlFor="vertical" className="font-normal cursor-pointer">
                      Vertical
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="horizontal" id="horizontal" />
                    <Label htmlFor="horizontal" className="font-normal cursor-pointer">
                      Horizontal
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Measurement System */}
              <div className="space-y-3">
                <Label className="text-base">Measurement System</Label>
                <RadioGroup
                  value={isMetric ? "metric" : "imperial"}
                  onValueChange={(value) => setIsMetric(value === "metric")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric" className="font-normal cursor-pointer">
                      Metric (mm)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="imperial" id="imperial" />
                    <Label htmlFor="imperial" className="font-normal cursor-pointer">
                      Imperial (inch)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Socket Size Label */}
              <div className="space-y-3">
                <Label className="text-base">Socket Size Label</Label>
                {isMetric ? (
                  <Select value={nominalMetric} onValueChange={setNominalMetric}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 22 }, (_, i) => i + 1).map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} mm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={nominalNumerator}
                      onChange={(e) => setNominalNumerator(e.target.value)}
                      placeholder="3"
                      min="1"
                      max="99"
                      required={!isMetric}
                      className="w-24"
                    />
                    <span className="text-muted-foreground text-lg">/</span>
                    <Input
                      type="number"
                      value={nominalDenominator}
                      onChange={(e) => setNominalDenominator(e.target.value)}
                      placeholder="8"
                      min="1"
                      max="99"
                      required={!isMetric}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">inch</span>
                  </div>
                )}
              </div>

              {/* Outer Diameter */}
              <div className="space-y-3">
                <Label className="text-base">Outer Diameter</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.1"
                    value={outerDiameter}
                    onChange={(e) => setOuterDiameter(e.target.value)}
                    placeholder="12.5"
                    required
                    className="flex-1"
                  />
                  <Select value={outerDiameterUnit} onValueChange={(v) => setOuterDiameterUnit(v as MeasurementUnit)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="in">in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Label Position (vertical only) */}
              {orientation === "vertical" && (
                <div className="space-y-3">
                  <Label className="text-base">Label Position</Label>
                  <Select value={labelPosition} onValueChange={(v) => setLabelPosition(v as LabelPosition)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topLeft">Top Left</SelectItem>
                      <SelectItem value="topMid">Top Middle</SelectItem>
                      <SelectItem value="topRight">Top Right</SelectItem>
                      <SelectItem value="bottomLeft">Bottom Left</SelectItem>
                      <SelectItem value="bottomMid">Bottom Middle</SelectItem>
                      <SelectItem value="bottomRight">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Length (horizontal only) */}
              {orientation === "horizontal" && (
                <div className="space-y-3">
                  <Label className="text-base">Length</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.1"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="25.4"
                      required
                      className="flex-1"
                    />
                    <Select value={lengthUnit} onValueChange={(v) => setLengthUnit(v as MeasurementUnit)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">mm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !!jobId}
                className="w-full h-12 text-base"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Wrench className="mr-2 h-5 w-5" />
                    Generate Socket Holder
                  </>
                )}
              </Button>
            </form>

            {/* Job Status */}
            {jobStatus && (
              <div className="mt-8 p-6 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Job Status</h3>
                  <Badge
                    variant={
                      jobStatus.status === "completed"
                        ? "success"
                        : jobStatus.status === "failed"
                          ? "destructive"
                          : jobStatus.status === "active"
                            ? "default"
                            : "warning"
                    }
                  >
                    {jobStatus.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Job ID: <code className="bg-muted px-1 rounded">{jobStatus.id}</code>
                </p>

                {jobStatus.status === "completed" && jobStatus.downloadUrl && (
                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <a href={jobStatus.downloadUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download STL (ZIP)
                      </a>
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Generate Another
                    </Button>
                  </div>
                )}

                {jobStatus.status === "failed" && (
                  <div className="space-y-3">
                    {jobStatus.error && (
                      <div className="flex items-start gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{jobStatus.error}</p>
                      </div>
                    )}
                    <Button variant="outline" onClick={resetForm} className="w-full">
                      Try Again
                    </Button>
                  </div>
                )}

                {(jobStatus.status === "pending" || jobStatus.status === "active") && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm">Processing your socket holder... Please wait.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Generated STL files are ready for 3D printing with standard settings
        </p>
      </div>
    </div>
  );
}
