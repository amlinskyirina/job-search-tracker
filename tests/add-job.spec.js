import { test, expect } from "@playwright/test";

test("adds a job and shows it in the job list", async ({ page }) => {
  const job = {
    title: "QA Engineer E2E",
    company: "Test Company",
    city: "חיפה",
    status: "נקבע ראיון",
  };

  await page.goto("/");

  const jobTitleLink = page.getByRole("link", {
    name: job.title,
    exact: true,
  });
  await expect(jobTitleLink).toHaveCount(0);

  const form = page.locator("form");

await form.scrollIntoViewIfNeeded();
  await form.getByLabel(/תפקיד/).fill(job.title);
  await form.getByLabel(/חברה/).fill(job.company);
  await form.getByLabel(/עיר/).fill(job.city);
  await form.getByLabel(/סטטוס/).selectOption({ label: job.status });
  await form.getByRole("button", { name: /שמירה|שמור/ }).click();

  const newCard = page.getByRole("article").filter({ has: jobTitleLink });

  await expect(newCard).toBeVisible();
  await newCard.scrollIntoViewIfNeeded();
  await expect(newCard).toContainText(job.company);
  await expect(newCard).toContainText(job.city);
  await expect(newCard).toContainText(job.status);
});

//הרצה 
// npx playwright test tests/add-job.spec.js --headed