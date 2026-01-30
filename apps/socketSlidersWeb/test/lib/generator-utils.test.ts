import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  type ConfigCardState,
  createEmptyCard,
  buildSocketConfig,
  formatCardSummary,
  isCardValid,
} from "~/lib/generator-utils";

// Mock crypto.randomUUID for consistent testing
beforeEach(() => {
  vi.spyOn(crypto, "randomUUID").mockReturnValue(
    "12345678-1234-1234-1234-123456781234"
  );
});

describe("generator-utils", () => {
  describe("createEmptyCard", () => {
    it("creates a card with a unique id", () => {
      const card = createEmptyCard();
      expect(card.id).toBe("12345678-1234-1234-1234-123456781234");
    });

    it("creates an expanded card by default", () => {
      const card = createEmptyCard();
      expect(card.expanded).toBe(true);
    });

    it("creates a collapsed card when specified", () => {
      const card = createEmptyCard(false);
      expect(card.expanded).toBe(false);
    });

    it("defaults to vertical orientation", () => {
      const card = createEmptyCard();
      expect(card.orientation).toBe("vertical");
    });

    it("defaults to metric measurement", () => {
      const card = createEmptyCard();
      expect(card.isMetric).toBe(true);
    });

    it("has empty nominal values", () => {
      const card = createEmptyCard();
      expect(card.nominalMetric).toBe("");
      expect(card.nominalImperial).toBe("");
    });

    it("has empty dimension values", () => {
      const card = createEmptyCard();
      expect(card.outerDiameter).toBe("");
      expect(card.length).toBe("");
    });

    it("defaults to mm units", () => {
      const card = createEmptyCard();
      expect(card.outerDiameterUnit).toBe("mm");
      expect(card.lengthUnit).toBe("mm");
    });

    it("defaults to topLeft label position for vertical", () => {
      const card = createEmptyCard();
      expect(card.labelPosition).toBe("topLeft");
    });

    it("defaults to bottom label position for horizontal", () => {
      const card = createEmptyCard();
      expect(card.horizontalLabelPosition).toBe("bottom");
    });
  });

  describe("buildSocketConfig", () => {
    it("builds a metric vertical socket config", () => {
      const card: ConfigCardState = {
        id: "test-id",
        expanded: true,
        orientation: "vertical",
        isMetric: true,
        nominalMetric: "10",
        nominalImperial: "",
        outerDiameter: "15.5",
        outerDiameterUnit: "mm",
        length: "",
        lengthUnit: "mm",
        labelPosition: "topLeft",
        horizontalLabelPosition: "bottom",
      };

      const config = buildSocketConfig(card);

      expect(config.orientation).toBe("vertical");
      expect(config.isMetric).toBe(true);
      expect(config.nominalMetric).toBe(10);
      expect(config.outerDiameter).toEqual({ value: 15.5, unit: "mm" });
      expect(config.labelPosition).toBe("topLeft");
    });

    it("builds an imperial vertical socket config", () => {
      const card: ConfigCardState = {
        id: "test-id",
        expanded: true,
        orientation: "vertical",
        isMetric: false,
        nominalMetric: "",
        nominalImperial: "3/8",
        outerDiameter: "0.6",
        outerDiameterUnit: "in",
        length: "",
        lengthUnit: "mm",
        labelPosition: "bottomLeft",
        horizontalLabelPosition: "bottom",
      };

      const config = buildSocketConfig(card);

      expect(config.orientation).toBe("vertical");
      expect(config.isMetric).toBe(false);
      expect(config.nominalNumerator).toBe(3);
      expect(config.nominalDenominator).toBe(8);
      expect(config.outerDiameter).toEqual({ value: 0.6, unit: "in" });
      expect(config.labelPosition).toBe("bottomLeft");
    });

    it("builds a horizontal socket config with length", () => {
      const card: ConfigCardState = {
        id: "test-id",
        expanded: true,
        orientation: "horizontal",
        isMetric: true,
        nominalMetric: "12",
        nominalImperial: "",
        outerDiameter: "18",
        outerDiameterUnit: "mm",
        length: "50",
        lengthUnit: "mm",
        labelPosition: "topLeft",
        horizontalLabelPosition: "top",
      };

      const config = buildSocketConfig(card);

      expect(config.orientation).toBe("horizontal");
      expect(config.length).toEqual({ value: 50, unit: "mm" });
      expect(config.labelPosition).toBe("top");
    });

    it("uses horizontalLabelPosition for horizontal sockets", () => {
      const card: ConfigCardState = {
        id: "test-id",
        expanded: true,
        orientation: "horizontal",
        isMetric: true,
        nominalMetric: "10",
        nominalImperial: "",
        outerDiameter: "15",
        outerDiameterUnit: "mm",
        length: "45",
        lengthUnit: "mm",
        labelPosition: "topLeft", // This should be ignored
        horizontalLabelPosition: "bottom",
      };

      const config = buildSocketConfig(card);
      expect(config.labelPosition).toBe("bottom");
    });

    it("handles inch units for diameter", () => {
      const card: ConfigCardState = {
        id: "test-id",
        expanded: true,
        orientation: "vertical",
        isMetric: false,
        nominalMetric: "",
        nominalImperial: "1/2",
        outerDiameter: "0.75",
        outerDiameterUnit: "in",
        length: "",
        lengthUnit: "mm",
        labelPosition: "topLeft",
        horizontalLabelPosition: "bottom",
      };

      const config = buildSocketConfig(card);
      expect(config.outerDiameter).toEqual({ value: 0.75, unit: "in" });
    });

    it("handles inch units for length", () => {
      const card: ConfigCardState = {
        id: "test-id",
        expanded: true,
        orientation: "horizontal",
        isMetric: true,
        nominalMetric: "10",
        nominalImperial: "",
        outerDiameter: "15",
        outerDiameterUnit: "mm",
        length: "2",
        lengthUnit: "in",
        labelPosition: "topLeft",
        horizontalLabelPosition: "top",
      };

      const config = buildSocketConfig(card);
      expect(config.length).toEqual({ value: 2, unit: "in" });
    });
  });

  describe("formatCardSummary", () => {
    it("returns placeholder for empty card", () => {
      const card = createEmptyCard();
      expect(formatCardSummary(card)).toBe("New socket configuration");
    });

    it("formats metric vertical socket summary", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        nominalMetric: "10",
        outerDiameter: "15",
        labelPosition: "topLeft",
      };
      expect(formatCardSummary(card)).toBe("Vertical 10mm (topLeft)");
    });

    it("formats imperial vertical socket summary", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        isMetric: false,
        nominalImperial: "3/8",
        outerDiameter: "15",
        labelPosition: "bottomLeft",
      };
      expect(formatCardSummary(card)).toBe("Vertical 3/8 (bottomLeft)");
    });

    it("formats horizontal socket summary", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        orientation: "horizontal",
        nominalMetric: "12",
        outerDiameter: "18",
      };
      expect(formatCardSummary(card)).toBe("Horizontal 12mm");
    });

    it("shows ? for missing metric size", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "15",
        nominalMetric: "",
      };
      expect(formatCardSummary(card)).toBe("Vertical ? (topLeft)");
    });

    it("shows ? for missing imperial size", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        isMetric: false,
        outerDiameter: "15",
        nominalImperial: "",
      };
      expect(formatCardSummary(card)).toBe("Vertical ? (topLeft)");
    });

    it("shows correct label position in summary", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        nominalMetric: "8",
        outerDiameter: "12",
        labelPosition: "bottomLeft",
      };
      expect(formatCardSummary(card)).toBe("Vertical 8mm (bottomLeft)");
    });
  });

  describe("isCardValid", () => {
    it("returns false for empty outerDiameter", () => {
      const card = createEmptyCard();
      expect(isCardValid(card)).toBe(false);
    });

    it("returns false for outerDiameter > 28", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "30",
        nominalMetric: "10",
      };
      expect(isCardValid(card)).toBe(false);
    });

    it("returns false for outerDiameter exactly at boundary (28.1)", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "28.1",
        nominalMetric: "10",
      };
      expect(isCardValid(card)).toBe(false);
    });

    it("returns true for outerDiameter at max (28)", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "28",
        nominalMetric: "10",
      };
      expect(isCardValid(card)).toBe(true);
    });

    it("returns false for imperial socket without size selection", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        isMetric: false,
        outerDiameter: "15",
        nominalImperial: "",
      };
      expect(isCardValid(card)).toBe(false);
    });

    it("returns true for valid imperial socket", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        isMetric: false,
        outerDiameter: "15",
        nominalImperial: "3/8",
      };
      expect(isCardValid(card)).toBe(true);
    });

    it("returns false for horizontal socket without length", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        orientation: "horizontal",
        outerDiameter: "15",
        nominalMetric: "10",
        length: "",
      };
      expect(isCardValid(card)).toBe(false);
    });

    it("returns true for valid horizontal socket", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        orientation: "horizontal",
        outerDiameter: "15",
        nominalMetric: "10",
        length: "50",
      };
      expect(isCardValid(card)).toBe(true);
    });

    it("returns true for valid vertical metric socket", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "15",
        nominalMetric: "10",
      };
      expect(isCardValid(card)).toBe(true);
    });

    it("validates metric socket without requiring nominalMetric", () => {
      // Metric sockets don't require nominalMetric for validity
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "15",
        nominalMetric: "", // Empty but still valid for metric
      };
      expect(isCardValid(card)).toBe(true);
    });

    it("validates small diameter", () => {
      const card: ConfigCardState = {
        ...createEmptyCard(),
        outerDiameter: "5",
        nominalMetric: "5",
      };
      expect(isCardValid(card)).toBe(true);
    });
  });
});
