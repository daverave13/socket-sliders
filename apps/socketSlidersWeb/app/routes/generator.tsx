import type { Route } from "./+types/generator";
import { useState, useEffect } from "react";
import type { JobResponse } from "@socketSliders/shared";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Wrench, Download, Loader2, AlertCircle, Plus, X } from "lucide-react";
import { SocketPreview } from "~/components/SocketPreview";
import type {
  MeasurementUnit,
  SocketOrientation,
  LabelPosition,
  HorizontalLabelPosition,
} from "@socketSliders/shared";
import {
  type ConfigCardState,
  createEmptyCard,
  buildSocketConfig,
  formatCardSummary,
  isCardValid,
} from "~/lib/generator-utils";

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
  // Array of config cards
  const [cards, setCards] = useState<ConfigCardState[]>([createEmptyCard()]);

  // Job state
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

  // Update a specific card
  const updateCard = (id: string, updates: Partial<ConfigCardState>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  // Toggle card expansion
  const toggleCard = (id: string) => {
    updateCard(id, {
      expanded: !cards.find((c) => c.id === id)?.expanded,
    });
  };

  // Add a new card
  const addCard = () => {
    setCards((prev) => [...prev, createEmptyCard()]);
  };

  // Remove a card
  const removeCard = (id: string) => {
    if (cards.length === 1) return; // Keep at least one card
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  // Full reset
  const resetAll = () => {
    setCards([createEmptyCard()]);
    setJobId(null);
    setJobStatus(null);
    setError(null);
  };

  // Submit all cards
  const handleSubmit = async () => {
    setError(null);

    // Validate all cards
    const invalidCards = cards.filter((card) => !isCardValid(card));
    if (invalidCards.length > 0) {
      setError(
        `Please complete all socket configurations before generating. ${invalidCards.length} card(s) have missing fields.`
      );
      // Expand invalid cards
      setCards((prev) =>
        prev.map((card) =>
          isCardValid(card) ? card : { ...card, expanded: true }
        )
      );
      return;
    }

    setSubmitting(true);

    try {
      const allConfigs = cards.map(buildSocketConfig);

      const response = await fetch("http://localhost:3000/api/v1/jobs/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socketConfigs: allConfigs }),
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

  const validCardCount = cards.filter(isCardValid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-3">
            Socket Slider Generator
          </h1>
          <p className="text-muted-foreground text-xl">
            Create custom 3D printable socket sliders for your workshop
          </p>
        </div>

        {/* Socket Config Cards */}
        {!jobStatus && (
          <div className="space-y-6">
            {cards.map((card, index) => (
              <Card
                key={card.id}
                className={`shadow-lg ${!isCardValid(card) && !card.expanded ? "border border-destructive" : ""}`}
              >
                <CardHeader
                  className="cursor-pointer select-none p-6"
                  onClick={() => toggleCard(card.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-xl">
                        Slider {index + 1}
                      </CardTitle>
                      {!card.expanded && (
                        <span className="text-base text-muted-foreground">
                          {formatCardSummary(card)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {cards.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCard(card.id);
                          }}
                          className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCard(card.id);
                        }}
                      >
                        {card.expanded ? "Collapse" : "Expand"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {card.expanded && (
                  <CardContent className="space-y-8 pt-0 px-6 pb-6">
                    {/* 3D Preview */}
                    <SocketPreview
                      orientation={card.orientation}
                      socketDiameter={
                        card.outerDiameterUnit === "mm"
                          ? parseFloat(card.outerDiameter) || 0
                          : (parseFloat(card.outerDiameter) || 0) * 25.4
                      }
                      socketLength={
                        card.lengthUnit === "mm"
                          ? parseFloat(card.length) || 50
                          : (parseFloat(card.length) || 2) * 25.4
                      }
                      labelText={
                        card.isMetric
                          ? card.nominalMetric
                            ? `${card.nominalMetric}`
                            : ""
                          : card.nominalNumerator && card.nominalDenominator
                            ? `${card.nominalNumerator}/${card.nominalDenominator}`
                            : ""
                      }
                      labelPosition={
                        card.orientation === "horizontal"
                          ? card.horizontalLabelPosition
                          : card.labelPosition
                      }
                    />

                    {/* Orientation */}
                    <div className="space-y-4">
                      <Label className="text-lg">Orientation</Label>
                      <RadioGroup
                        value={card.orientation}
                        onValueChange={(value) =>
                          updateCard(card.id, {
                            orientation: value as SocketOrientation,
                          })
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="vertical"
                            id={`vertical-${card.id}`}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`vertical-${card.id}`}
                            className="font-normal cursor-pointer text-base"
                          >
                            Vertical
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="horizontal"
                            id={`horizontal-${card.id}`}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`horizontal-${card.id}`}
                            className="font-normal cursor-pointer text-base"
                          >
                            Horizontal
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Measurement System */}
                    <div className="space-y-4">
                      <Label className="text-lg">Measurement System</Label>
                      <RadioGroup
                        value={card.isMetric ? "metric" : "imperial"}
                        onValueChange={(value) =>
                          updateCard(card.id, { isMetric: value === "metric" })
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="metric"
                            id={`metric-${card.id}`}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`metric-${card.id}`}
                            className="font-normal cursor-pointer text-base"
                          >
                            Metric (mm)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="imperial"
                            id={`imperial-${card.id}`}
                            className="h-5 w-5"
                          />
                          <Label
                            htmlFor={`imperial-${card.id}`}
                            className="font-normal cursor-pointer text-base"
                          >
                            Imperial (inch)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Socket Size Label */}
                    <div className="space-y-4">
                      <Label className="text-lg">Socket Size Label</Label>
                      {card.isMetric ? (
                        <Select
                          value={card.nominalMetric}
                          onValueChange={(value) =>
                            updateCard(card.id, { nominalMetric: value })
                          }
                        >
                          <SelectTrigger
                            className={`h-12 text-base ${card.nominalMetric === "" ? "border border-destructive" : ""}`}
                          >
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 22 }, (_, i) => i + 1).map(
                              (size) => (
                                <SelectItem
                                  key={size}
                                  value={size.toString()}
                                  className="text-base"
                                >
                                  {size} mm
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={card.nominalNumerator}
                            onChange={(e) =>
                              updateCard(card.id, {
                                nominalNumerator: e.target.value,
                              })
                            }
                            min="1"
                            max="99"
                            className={`w-28 h-12 text-base ${card.nominalNumerator ? "" : "border border-destructive"}`}
                          />
                          <span className="text-muted-foreground text-xl">
                            /
                          </span>
                          <Input
                            type="number"
                            value={card.nominalDenominator}
                            onChange={(e) =>
                              updateCard(card.id, {
                                nominalDenominator: e.target.value,
                              })
                            }
                            min="1"
                            max="99"
                            // className="w-28 h-12 text-base"
                            className={`w-28 h-12 text-base ${card.nominalDenominator ? "" : "border border-destructive"}`}
                          />
                          <span className="text-muted-foreground text-base">
                            inch
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Outer Diameter */}
                    <div className="space-y-4">
                      <Label className="text-lg">
                        Outer Diameter
                        <p className="text-sm text-destructive my-1">
                          {card.outerDiameter &&
                          parseFloat(card.outerDiameter) > 28
                            ? "Value must be 28 or less"
                            : ""}
                        </p>
                      </Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          step="0.1"
                          value={card.outerDiameter}
                          onChange={(e) =>
                            updateCard(card.id, {
                              outerDiameter: e.target.value,
                            })
                          }
                          className={`flex-1 h-12 text-base ${!card.outerDiameter || parseFloat(card.outerDiameter) > 28 ? "border border-destructive" : ""}`}
                        />
                        <Select
                          value={card.outerDiameterUnit}
                          onValueChange={(v) =>
                            updateCard(card.id, {
                              outerDiameterUnit: v as MeasurementUnit,
                            })
                          }
                        >
                          <SelectTrigger className="w-28 h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mm" className="text-base">
                              mm
                            </SelectItem>
                            <SelectItem value="in" className="text-base">
                              in
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Label Position (vertical only) */}
                    {card.orientation === "vertical" && (
                      <div className="space-y-4">
                        <Label className="text-lg">Label Position</Label>
                        <Select
                          value={card.labelPosition}
                          onValueChange={(v) =>
                            updateCard(card.id, {
                              labelPosition: v as LabelPosition,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="topLeft" className="text-base">
                              Top Left
                            </SelectItem>
                            <SelectItem value="topMid" className="text-base">
                              Top Middle
                            </SelectItem>
                            <SelectItem value="topRight" className="text-base">
                              Top Right
                            </SelectItem>
                            <SelectItem
                              value="bottomLeft"
                              className="text-base"
                            >
                              Bottom Left
                            </SelectItem>
                            <SelectItem value="bottomMid" className="text-base">
                              Bottom Middle
                            </SelectItem>
                            <SelectItem
                              value="bottomRight"
                              className="text-base"
                            >
                              Bottom Right
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Length (horizontal only) */}
                    {card.orientation === "horizontal" && (
                      <div className="space-y-4">
                        <Label className="text-lg">
                          Length
                          <p className="text-sm text-destructive my-1">
                            {card.length && parseFloat(card.length) > 66
                              ? "Value must be 66 or less"
                              : ""}
                          </p>
                        </Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            step="0.1"
                            value={card.length}
                            onChange={(e) =>
                              updateCard(card.id, { length: e.target.value })
                            }
                            className={`flex-1 h-12 text-base ${card.length || parseFloat(card.length) > 66 ? "" : "border border-destructive"}`}
                          />
                          <Select
                            value={card.lengthUnit}
                            onValueChange={(v) =>
                              updateCard(card.id, {
                                lengthUnit: v as MeasurementUnit,
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-12 text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mm" className="text-base">
                                mm
                              </SelectItem>
                              <SelectItem value="in" className="text-base">
                                in
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Label Position (horizontal only) */}
                    {card.orientation === "horizontal" && (
                      <div className="space-y-4">
                        <Label className="text-lg">Label Position</Label>
                        <Select
                          value={card.horizontalLabelPosition}
                          onValueChange={(v) =>
                            updateCard(card.id, {
                              horizontalLabelPosition:
                                v as HorizontalLabelPosition,
                            })
                          }
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top" className="text-base">
                              Top
                            </SelectItem>
                            <SelectItem value="bottom" className="text-base">
                              Bottom
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Add Another & Generate Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={addCard}
                disabled={submitting}
                className="flex-1 h-14 text-base"
              >
                <Plus className="mr-2 h-6 w-6" />
                Add Another Socket
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || validCardCount === 0}
                className="flex-1 h-14 text-lg"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Wrench className="mr-2 h-6 w-6" />
                    Generate ({cards.length})
                  </>
                )}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-5 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6 flex-shrink-0" />
                <p className="text-base">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Job Status */}
        {jobStatus && (
          <Card className="shadow-lg">
            <CardContent className="pt-8 px-8 pb-8">
              <div className="p-8 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-xl">Job Status</h3>
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
                    className="text-base px-3 py-1"
                  >
                    {jobStatus.status}
                  </Badge>
                </div>

                <p className="text-base text-muted-foreground mb-6">
                  Job ID:{" "}
                  <code className="bg-muted px-2 py-1 rounded">
                    {jobStatus.id}
                  </code>
                </p>

                {jobStatus.status === "completed" && jobStatus.downloadUrl && (
                  <div className="flex gap-4">
                    <Button asChild className="flex-1 h-12 text-base">
                      <a href={jobStatus.downloadUrl} download>
                        <Download className="mr-2 h-5 w-5" />
                        Download{" "}
                        {jobStatus.downloadUrl.endsWith(".zip") ? "ZIP" : "STL"}
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="h-12 text-base"
                    >
                      Start Over
                    </Button>
                  </div>
                )}

                {jobStatus.status === "failed" && (
                  <div className="space-y-4">
                    {jobStatus.error && (
                      <div className="flex items-start gap-3 text-destructive">
                        <AlertCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                        <p className="text-base">{jobStatus.error}</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="w-full h-12 text-base"
                    >
                      Start Over
                    </Button>
                  </div>
                )}

                {(jobStatus.status === "pending" ||
                  jobStatus.status === "active") && (
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-base">
                      Processing your socket holder{cards.length > 1 ? "s" : ""}
                      ... Please wait.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-base text-muted-foreground mt-12">
          Generated STL files are ready for 3D printing with standard settings
        </p>
      </div>
    </div>
  );
}
