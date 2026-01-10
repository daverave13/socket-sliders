import type {
  SocketConfig,
  MeasurementUnit,
  SocketOrientation,
  LabelPosition,
  HorizontalLabelPosition,
} from "@socketSliders/shared";

// Form state for a single socket config card
export interface ConfigCardState {
  id: string;
  expanded: boolean;
  orientation: SocketOrientation;
  isMetric: boolean;
  nominalMetric: string;
  nominalNumerator: string;
  nominalDenominator: string;
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
  nominalNumerator: "",
  nominalDenominator: "",
  outerDiameter: "",
  outerDiameterUnit: "mm",
  length: "",
  lengthUnit: "mm",
  labelPosition: "topLeft",
  horizontalLabelPosition: "bottom",
});

// Build SocketConfig from card state
export const buildSocketConfig = (card: ConfigCardState): SocketConfig => {
  return {
    orientation: card.orientation,
    isMetric: card.isMetric,
    ...(card.isMetric
      ? { nominalMetric: parseInt(card.nominalMetric) }
      : {
          nominalNumerator: parseInt(card.nominalNumerator),
          nominalDenominator: parseInt(card.nominalDenominator),
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
      ? `${card.nominalMetric}`
      : "?"
    : card.nominalNumerator && card.nominalDenominator
      ? `${card.nominalNumerator}/${card.nominalDenominator}`
      : "?";

  if (card.orientation === "horizontal") {
    return `Horizontal ${sizeLabel}`;
  }
  return `Vertical ${sizeLabel} (${card.labelPosition})`;
};

// Check if a card has valid data for submission
export const isCardValid = (card: ConfigCardState): boolean => {
  if (!card.outerDiameter) return false;
  if (card.outerDiameter && parseFloat(card.outerDiameter) > 28) return false;
  if (!card.isMetric && (!card.nominalNumerator || !card.nominalDenominator))
    return false;
  if (card.orientation === "horizontal" && !card.length) return false;
  return true;
};
