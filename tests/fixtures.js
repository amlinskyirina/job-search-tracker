import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto("/");

    await page.evaluate(async () => {
      const { signInTestUser } = await import("/src/firebase.js");
      await signInTestUser();
    });

    await expect(
      page.getByText("המשרות נשמרות בחשבון שלך בענן.", {
        exact: true,
      }),
    ).toBeVisible();

    await use(page);
  },
});

export { expect };

export async function addJob(page, job) {
  const form = page.locator("form");

  await form.getByLabel(/תפקיד/).fill(job.title);
  await form.getByLabel(/חברה/).fill(job.company);
  await form.getByLabel(/עיר/).fill(job.city);
  await form
    .getByLabel(/סטטוס/)
    .selectOption({ label: job.status });

  await form
    .getByRole("button", { name: "שמירה", exact: true })
    .click();

  await expect(
    page.getByRole("link", {
      name: job.title,
      exact: true,
    }),
  ).toBeVisible();
}