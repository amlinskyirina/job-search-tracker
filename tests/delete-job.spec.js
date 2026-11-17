import { test, expect } from "@playwright/test";

test("keeps a job on cancel and removes it on confirmation", async ({ page }) => {
  const title = "QA Engineer - Delete Test";

  await page.goto("/");

  const jobLinks = page.getByRole("article").getByRole("link");
  const existingTitle = (await jobLinks.first().innerText()).trim();
  const existingJob = page.getByRole("link", {
    name: existingTitle,
    exact: true,
  });

  const form = page.locator("form");
  await form.getByLabel(/תפקיד/).fill(title);
  await form.getByLabel(/חברה/).fill("Test Company");
  await form.getByLabel(/עיר/).fill("חיפה");
  await form.getByLabel(/סטטוס/).selectOption({ label: "נקבע ראיון" });
  await form.getByRole("button", { name: "שמירה", exact: true }).click();

  const jobLink = page.getByRole("link", { name: title, exact: true });
  await jobLink.click();

  const detailsUrl = page.url();
  const deleteButton = page.getByRole("button", {
    name: "מחיקת משרה",
    exact: true,
  });
  const modal = page.getByRole("dialog", {
    name: "מחיקת משרה",
    exact: true,
  });

  // ביטול סוגר את החלון ומשאיר את המשרה בדף הפרטים.
  await deleteButton.click();
  await expect(modal).toBeVisible();
  await expect(modal).toContainText(title);
  await modal.getByRole("button", { name: "ביטול", exact: true }).click();

  await expect(modal).toBeHidden();
  await expect(page).toHaveURL(detailsUrl);
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();

  // אישור מחזיר לרשימה ומסיר את המשרה שנבחרה.
  await deleteButton.click();
  await modal.getByRole("button", { name: "מחיקה", exact: true }).click();

  await expect(page).toHaveURL(new URL("/", detailsUrl).href);
  await expect(jobLink).toHaveCount(0);
  await expect(existingJob).toBeVisible();

  await page.reload();
  await expect(existingJob).toBeVisible();
  await expect(jobLink).toHaveCount(0);
});