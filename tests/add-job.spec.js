import { test, expect, addJob } from "./fixtures.js";

test("adds a job and keeps it after reload", async ({ page }) => {
  const job = {
    title: "QA Engineer E2E",
    company: "Test Company",
    city: "חיפה",
    status: "נקבע ראיון",
  };

  const jobTitleLink = page.getByRole("link", {
    name: job.title,
    exact: true,
  });

  await expect(jobTitleLink).toHaveCount(0);

  await addJob(page, job);

  const newCard = page
    .getByRole("article")
    .filter({ has: jobTitleLink });

  await expect(newCard).toContainText(job.company);
  await expect(newCard).toContainText(job.city);
  await expect(newCard).toContainText(job.status);

  await page.reload();

  await expect(jobTitleLink).toBeVisible();
  await expect(newCard).toContainText(job.company);
});

//הרצה 
// npx playwright test tests/add-job.spec.js --headed