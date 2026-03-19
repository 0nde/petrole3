import { test, expect } from "@playwright/test";

test.describe("PetroSim Smoke Tests", () => {
  test("loads the app and shows header", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=PetroSim")).toBeVisible();
  });

  test("shows scenarios panel by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Scenarios")).toBeVisible();
  });

  test("can switch between Simple and Expert mode", async ({ page }) => {
    await page.goto("/");
    const expertBtn = page.locator("button", { hasText: "Expert" });
    await expertBtn.click();
    await expect(expertBtn).toHaveClass(/bg-petro-600/);
  });

  test("map container renders", async ({ page }) => {
    await page.goto("/");
    const mapCanvas = page.locator(".maplibregl-canvas");
    await expect(mapCanvas).toBeVisible({ timeout: 10000 });
  });
});
