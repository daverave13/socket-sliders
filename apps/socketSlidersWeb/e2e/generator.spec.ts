import { test, expect } from "@playwright/test";

test.describe("Generator Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/generators");
  });

  test("displays the generator form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Socket Holder Generator" })).toBeVisible();
    await expect(page.getByText("Configure Your Socket")).toBeVisible();
  });

  test("has orientation radio buttons", async ({ page }) => {
    await expect(page.getByLabel("Vertical")).toBeVisible();
    await expect(page.getByLabel("Horizontal")).toBeVisible();
  });

  test("has measurement system radio buttons", async ({ page }) => {
    await expect(page.getByLabel("Metric (mm)")).toBeVisible();
    await expect(page.getByLabel("Imperial (inch)")).toBeVisible();
  });

  test("shows metric size dropdown by default", async ({ page }) => {
    // Metric is selected by default
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });

  test("switches to imperial inputs when imperial is selected", async ({ page }) => {
    await page.getByLabel("Imperial (inch)").click();

    // Should show numerator and denominator inputs
    await expect(page.getByPlaceholder("3")).toBeVisible();
    await expect(page.getByPlaceholder("8")).toBeVisible();
  });

  test("shows label position dropdown for vertical orientation", async ({ page }) => {
    // Vertical is selected by default
    await expect(page.getByText("Label Position")).toBeVisible();
  });

  test("shows length input for horizontal orientation", async ({ page }) => {
    await page.getByLabel("Horizontal").click();

    // Label Position should be hidden, Length should appear
    await expect(page.getByText("Label Position")).not.toBeVisible();
    await expect(page.getByText("Length")).toBeVisible();
  });

  test("can fill out the form", async ({ page }) => {
    // Select metric size
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "10 mm" }).click();

    // Fill outer diameter
    await page.getByPlaceholder("12.5").fill("15.5");

    // Submit button should be enabled
    await expect(page.getByRole("button", { name: /generate socket holder/i })).toBeEnabled();
  });
});
