import { test, expect, addJob } from "./fixtures.js";

test("edits an existing job and keeps the change after reload", async ({
  page,
}) => {
  const job = {
    title: "QA Engineer - Edit Test",
    company: "Test Company",
    city: "חיפה",
    status: "נקבע ראיון",
  };

  const updatedCity = "קריית מוצקין";

  await addJob(page, job);

  await page
    .getByRole("link", { name: job.title, exact: true })
    .click();

  await page
    .getByRole("button", { name: "עריכת משרה", exact: true })
    .click();

  const editForm = page.locator("form");
  const cityInput = editForm.getByLabel(/עיר/);

  await expect(cityInput).toHaveValue(job.city);
  await cityInput.fill(updatedCity);

  await editForm
    .getByRole("button", { name: "שמירה", exact: true })
    .click();

  await expect(editForm).toHaveCount(0);

  const cityDetails = page.getByText(
    `עיר: ${updatedCity}`,
    { exact: true },
  );

  await expect(cityDetails).toBeVisible();

  await page.reload();

  await expect(cityDetails).toBeVisible();
});