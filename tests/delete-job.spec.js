import { test, expect, addJob } from "./fixtures.js";

test("keeps a job on cancel and removes it on confirmation", async ({
  page,
}) => {
  const retainedJob = {
    title: "QA Engineer - Keep Test",
    company: "Keep Company",
    city: "חיפה",
    status: "נשמרה",
  };

  const deletedJob = {
    title: "QA Engineer - Delete Test",
    company: "Delete Company",
    city: "תל אביב",
    status: "נקבע ראיון",
  };

  await addJob(page, retainedJob);
  await addJob(page, deletedJob);

  const retainedLink = page.getByRole("link", {
    name: retainedJob.title,
    exact: true,
  });

  const deletedLink = page.getByRole("link", {
    name: deletedJob.title,
    exact: true,
  });

  await deletedLink.click();

  const detailsUrl = page.url();

  const deleteButton = page.getByRole("button", {
    name: "מחיקת משרה",
    exact: true,
  });

  const modal = page.getByRole("dialog", {
    name: "מחיקת משרה",
    exact: true,
  });

  await deleteButton.click();

  await expect(modal).toBeVisible();
  await expect(modal).toContainText(deletedJob.title);

  await modal
    .getByRole("button", { name: "ביטול", exact: true })
    .click();

  await expect(modal).toBeHidden();
  await expect(page).toHaveURL(detailsUrl);

  await expect(
    page.getByRole("heading", {
      name: deletedJob.title,
      exact: true,
    }),
  ).toBeVisible();

  await deleteButton.click();

  await modal
    .getByRole("button", { name: "מחיקה", exact: true })
    .click();

  await expect(page).toHaveURL(new URL("/", detailsUrl).href);
  await expect(retainedLink).toBeVisible();
  await expect(deletedLink).toHaveCount(0);

  await page.reload();

  await expect(retainedLink).toBeVisible();
  await expect(deletedLink).toHaveCount(0);
});