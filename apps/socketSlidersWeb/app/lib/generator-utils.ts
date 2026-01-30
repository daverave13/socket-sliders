import type {
  SocketConfig,
  MeasurementUnit,
  SocketOrientation,
  LabelPosition,
  HorizontalLabelPosition,
} from "@socketSliders/shared";

// Available imperial sizes (sorted by actual size)
// These correspond to DXF labels in app/data/labels.json
export const IMPERIAL_SIZES = [
  { value: "1/4", label: '1/4"', numerator: 1, denominator: 4 },
  { value: "5/16", label: '5/16"', numerator: 5, denominator: 16 },
  { value: "11/32", label: '11/32"', numerator: 11, denominator: 32 },
  { value: "3/8", label: '3/8"', numerator: 3, denominator: 8 },
  { value: "13/32", label: '13/32"', numerator: 13, denominator: 32 },
  { value: "7/16", label: '7/16"', numerator: 7, denominator: 16 },
  { value: "1/2", label: '1/2"', numerator: 1, denominator: 2 },
  { value: "11/16", label: '11/16"', numerator: 11, denominator: 16 },
  { value: "3/4", label: '3/4"', numerator: 3, denominator: 4 },
  { value: "13/16", label: '13/16"', numerator: 13, denominator: 16 },
  { value: "7/8", label: '7/8"', numerator: 7, denominator: 8 },
];

// Form state for a single socket config card
export interface ConfigCardState {
  id: string;
  expanded: boolean;
  orientation: SocketOrientation;
  isMetric: boolean;
  nominalMetric: string;
  nominalImperial: string; // e.g., "3/8"
  outerDiameter: string;
  outerDiameterUnit: MeasurementUnit;
  length: string;
  lengthUnit: MeasurementUnit;
  labelPosition: LabelPosition;
  horizontalLabelPosition: HorizontalLabelPosition;
}

// Create a new empty config card
export const createEmptyCard = (expanded = true): ConfigCardState => ({
  id: crypto.randomUUID(),
  expanded,
  orientation: "vertical",
  isMetric: true,
  nominalMetric: "",
  nominalImperial: "",
  outerDiameter: "",
  outerDiameterUnit: "mm",
  length: "",
  lengthUnit: "mm",
  labelPosition: "topLeft",
  horizontalLabelPosition: "bottom",
});

// Build SocketConfig from card state
export const buildSocketConfig = (card: ConfigCardState): SocketConfig => {
  // Parse imperial fraction if needed
  const imperialSize = IMPERIAL_SIZES.find((s) => s.value === card.nominalImperial);

  return {
    orientation: card.orientation,
    isMetric: card.isMetric,
    ...(card.isMetric
      ? { nominalMetric: parseInt(card.nominalMetric) }
      : {
          nominalNumerator: imperialSize?.numerator ?? 0,
          nominalDenominator: imperialSize?.denominator ?? 1,
        }),
    outerDiameter: {
      value: parseFloat(card.outerDiameter),
      unit: card.outerDiameterUnit,
    },
    ...(card.orientation === "horizontal"
      ? {
          length: {
            value: parseFloat(card.length),
            unit: card.lengthUnit,
          },
          labelPosition: card.horizontalLabelPosition,
        }
      : { labelPosition: card.labelPosition }),
  } as SocketConfig;
};

// Format card for collapsed display
export const formatCardSummary = (card: ConfigCardState): string => {
  if (!card.outerDiameter) return "New socket configuration";

  const sizeLabel = card.isMetric
    ? card.nominalMetric
      ? `${card.nominalMetric}mm`
      : "?"
    : card.nominalImperial || "?";

  if (card.orientation === "horizontal") {
    return `Horizontal ${sizeLabel}`;
  }
  return `Vertical ${sizeLabel} (${card.labelPosition})`;
};

// Check if a card has valid data for submission
export const isCardValid = (card: ConfigCardState): boolean => {
  if (!card.outerDiameter) return false;
  if (card.outerDiameter && parseFloat(card.outerDiameter) > 28) return false;
  if (!card.isMetric && !card.nominalImperial) return false;
  if (card.orientation === "horizontal" && !card.length) return false;
  return true;
};
