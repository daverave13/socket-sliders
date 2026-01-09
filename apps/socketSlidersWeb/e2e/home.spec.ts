import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays the main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "SocketSliders" })).toBeVisible();
  });

  test("displays features list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Vertical and horizontal socket holder designs")).toBeVisible();
    await expect(page.getByText("Support for metric and imperial measurements")).toBeVisible();
  });

  test("navigates to generator page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /generate socket holder/i }).click();
    await expect(page).toHaveURL("/generators");
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");

    // Initially should be light mode (no dark class)
    const html = page.locator("html");

    // Click the theme toggle button
    await page.getByRole("button", { name: /switch to dark mode/i }).click();

    // Should now have dark class
    await expect(html).toHaveClass(/dark/);

    // Click again to switch back
    await page.getByRole("button", { name: /switch to light mode/i }).click();

    // Dark class should be removed
    await expect(html).not.toHaveClass(/dark/);
  });
});
