# Socket Generator Requirements

---

## 1. Supported Model Types

### Vertical Socket Holder

- Orientation: `vertical`
- Required geometry:
  - Outer diameter (measured value)

### Horizontal Socket Holder

- Orientation: `horizontal`
- Required geometry:
  - Outer diameter (measured value)
  - Length (measured value)

---

## 2. Measurement Rules

- Measurements may be entered in:
  - Metric (mm)
  - Imperial (inches)
- All internal calculations use metric (mm)
- Original submitted value and unit must be preserved

---

## 3. Nominal Labeling Rules

### Common Constraints

- All nominal values:
  - Integers only
  - Maximum two digits (≤ 99)

### Metric Nominal

- `isMetric = true`
- Requires:
  - `nominalMetric`
- Forbids:
  - `nominalNumerator`
  - `nominalDenominator`

### Imperial Nominal

- `isMetric = false`
- Requires:
  - `nominalNumerator`
  - `nominalDenominator`
- Forbids:
  - `nominalMetric`
- Denominator must be ≥ 1

---

## 4. Input Shape (Logical)

```ts
{
  orientation: "vertical" | "horizontal",
  isMetric: boolean,
  nominalMetric?: number,
  nominalNumerator?: number,
  nominalDenominator?: number,
  outerDiameter: {
    value: number,
    unit: "mm" | "in"
  },
  length?: {
    value: number,
    unit: "mm" | "in"
  }
}
```
