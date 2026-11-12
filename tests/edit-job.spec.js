
//npx playwright test tests/edit-job.spec.js --headed

import { test, expect } from "@playwright/test";

test("edits an existing job and keeps the change after reload", async ({ page }) => {
  const title = "QA Engineer - Edit Test";
  const originalCity = "חיפה";
  const updatedCity = "קריית מוצקין";

  // יוצרים משרה עם נתוני בדיקה ידועים.
  await page.goto("/");

  const addForm = page.locator("form");
  await addForm.getByLabel(/תפקיד/).fill(title);
  await addForm.getByLabel(/חברה/).fill("Test Company");
  await addForm.getByLabel(/עיר/).fill(originalCity);
  await addForm.getByLabel(/סטטוס/).selectOption({ label: "נקבע ראיון" });
  await addForm.getByRole("button", { name: "שמירה", exact: true }).click();

  // פותחים את טופס העריכה ובודקים את העיר הקיימת.
  await page.getByRole("link", { name: title, exact: true }).click();
  await page.getByRole("button", { name: "עריכת משרה", exact: true }).click();

  const editForm = page.locator("form");
  const cityInput = editForm.getByLabel(/עיר/);

  await expect(cityInput).toHaveValue(originalCity);
  await cityInput.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000); // להדגמה: רואים את חיפה.

  // משנים את העיר ומציגים את הערך החדש לפני השמירה.
  await cityInput.fill(updatedCity);
  await page.waitForTimeout(2000); // להדגמה: רואים את קריית מוצקין.
  await editForm.getByRole("button", { name: "שמירה", exact: true }).click();

  await expect(editForm).toHaveCount(0);

  const cityDetails = page.getByText(`עיר: ${updatedCity}`, { exact: true });
  await expect(cityDetails).toBeVisible();

  // בודקים שהעיר החדשה נשמרה גם אחרי רענון.
  await page.reload();
  await expect(cityDetails).toBeVisible();
  await cityDetails.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000); // להדגמה: רואים את העיר אחרי הרענון.
});
