import { expect, test } from "@playwright/test";

test("catalog shows mocked events", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Eventos", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText("Concierto Arena 2026", { exact: false }),
  ).toBeVisible();
});
