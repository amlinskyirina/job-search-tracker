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

  // מבטלים את המחיקה ובודקים שהמשרה עדיין פתוחה.
  page.once("dialog", (dialog) => dialog.dismiss());
  await deleteButton.click();

  await expect(page).toHaveURL(detailsUrl);
  await expect(page.getByRole("heading", { name: title, exact: true }))
    .toBeVisible();

  // מאשרים את המחיקה ובודקים את ההודעה שהוצגה.
  const confirmation = page.waitForEvent("dialog").then(async (dialog) => {
    const message = dialog.message();
    await dialog.accept();
    return message;
  });

  const [message] = await Promise.all([confirmation, deleteButton.click()]);
  expect(message).toContain(title);

  await expect(page).toHaveURL(new URL("/", detailsUrl).href);
  await expect(jobLink).toHaveCount(0);
  await expect(existingJob).toBeVisible();

  await page.reload();
  await expect(existingJob).toBeVisible();
  await expect(jobLink).toHaveCount(0);
});