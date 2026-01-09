import { z } from "zod";

/**
 * Socket orientation types
 */
export const SocketOrientationSchema = z.enum(["vertical", "horizontal"]);
export type SocketOrientation = z.infer<typeof SocketOrientationSchema>;

/**
 * Measurement unit types
 */
export const MeasurementUnitSchema = z.enum(["mm", "in"]);
export type MeasurementUnit = z.infer<typeof MeasurementUnitSchema>;

/**
 * Label position for vertical sockets
 */
export const LabelPositionSchema = z.enum([
  "topLeft",
  "topMid",
  "topRight",
  "bottomLeft",
  "bottomMid",
  "bottomRight",
]);
export type LabelPosition = z.infer<typeof LabelPositionSchema>;

/**
 * Label position for horizontal sockets
 */
export const HorizontalLabelPositionSchema = z.enum(["top", "bottom"]);
export type HorizontalLabelPosition = z.infer<typeof HorizontalLabelPositionSchema>;

/**
 * Measurement with value and unit
 */
export const MeasurementSchema = z.object({
  value: z.number().positive("Value must be positive"),
  unit: MeasurementUnitSchema,
});
export type Measurement = z.infer<typeof MeasurementSchema>;

/**
 * Metric socket specification (uses metric nominal value)
 */
export const MetricSocketSchema = z.object({
  isMetric: z.literal(true),
  nominalMetric: z.number().int().min(1).max(99, "Metric nominal must be ≤ 99"),
  nominalNumerator: z.undefined(),
  nominalDenominator: z.undefined(),
});

/**
 * Imperial socket specification (uses fractional nominal value)
 */
export const ImperialSocketSchema = z.object({
  isMetric: z.literal(false),
  nominalMetric: z.undefined(),
  nominalNumerator: z.number().int().min(1).max(99, "Numerator must be ≤ 99"),
  nominalDenominator: z
    .number()
    .int()
    .min(1)
    .max(99, "Denominator must be ≤ 99"),
});

/**
 * Nominal specification - either metric or imperial
 */
export const NominalSpecSchema = z.discriminatedUnion("isMetric", [
  MetricSocketSchema,
  ImperialSocketSchema,
]);
export type NominalSpec = z.infer<typeof NominalSpecSchema>;

/**
 * Base socket configuration (common fields)
 */
const BaseSocketConfigSchema = z.object({
  orientation: SocketOrientationSchema,
  outerDiameter: MeasurementSchema,
});

/**
 * Vertical socket configuration (no length required)
 */
const VerticalBaseSchema = BaseSocketConfigSchema.extend({
  orientation: z.literal("vertical"),
  length: z.undefined(),
  labelPosition: LabelPositionSchema.optional(),
});

export const VerticalSocketConfigSchema = z.union([
  VerticalBaseSchema.merge(MetricSocketSchema),
  VerticalBaseSchema.merge(ImperialSocketSchema),
]);

/**
 * Horizontal socket configuration (length required)
 */
const HorizontalBaseSchema = BaseSocketConfigSchema.extend({
  orientation: z.literal("horizontal"),
  length: MeasurementSchema,
  labelPosition: HorizontalLabelPositionSchema.optional(),
});

export const HorizontalSocketConfigSchema = z.union([
  HorizontalBaseSchema.merge(MetricSocketSchema),
  HorizontalBaseSchema.merge(ImperialSocketSchema),
]);

/**
 * Complete socket configuration - union of vertical and horizontal
 */
export const SocketConfigSchema = z.union([
  VerticalSocketConfigSchema,
  HorizontalSocketConfigSchema,
]);

export type SocketConfig = z.infer<typeof SocketConfigSchema>;
export type VerticalSocketConfig = z.infer<typeof VerticalSocketConfigSchema>;
export type HorizontalSocketConfig = z.infer<
  typeof HorizontalSocketConfigSchema
>;

/**
 * Helper to convert measurement to millimeters
 */
export function toMillimeters(measurement: Measurement): number {
  if (measurement.unit === "mm") {
    return measurement.value;
  }
  // Convert inches to mm (1 inch = 25.4 mm)
  return measurement.value * 25.4;
}

/**
 * Helper to format nominal label for display
 */
export function formatNominalLabel(config: SocketConfig): string {
  if (config.isMetric) {
    return `${config.nominalMetric}mm`;
  }
  return `${config.nominalNumerator}/${config.nominalDenominator}"`;
}
