import { expect, type Page, test } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

const hasCredentials = Boolean(email && password);

/** Signs in via the home page and waits until the chat route is active. */
async function signIn(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Email").fill(email ?? "");
  await page.getByLabel("Password").fill(password ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/chat/, { timeout: 30_000 });
}

/** Sidebar thread row buttons (excludes footer chrome actions). */
function sidebarThreadButtons(page: Page) {
  const sidebar = page.locator('[data-sidebar="sidebar"]');
  return sidebar
    .getByRole("button")
    .filter({ hasNotText: /^(New chat|New project|Settings|Chats|Archived)/ });
}

test.describe("chat", () => {
  test.beforeEach(() => {
    test.skip(
      !hasCredentials,
      "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run chat E2E tests.",
    );
  });

  test("sign-in, send message, stream completes, thread switch", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/chat");

    const composer = page.getByPlaceholder("Message…");
    await expect(composer).toBeVisible();

    const threadsBefore = sidebarThreadButtons(page);
    const priorThreadLabel =
      (await threadsBefore.count()) > 0
        ? ((await threadsBefore.first().textContent()) ?? "").trim()
        : null;

    await page.getByRole("button", { name: "New chat" }).click();

    const uniqueMessage = `E2E probe ${Date.now()}`;
    await composer.fill(uniqueMessage);
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText(uniqueMessage, { exact: true })).toBeVisible();
    await expect(page.getByText("Generating…")).toBeVisible();
    await expect(page.getByText("Generating…")).toBeHidden({
      timeout: 120_000,
    });
    await expect(composer).toBeEnabled();
    await expect(page).toHaveURL(/thread=/, { timeout: 30_000 });

    const threadsAfter = sidebarThreadButtons(page);
    await expect(threadsAfter).not.toHaveCount(0);

    if (priorThreadLabel) {
      await threadsAfter.filter({ hasText: priorThreadLabel }).first().click();
    } else {
      await expect(threadsAfter).toHaveCount(1);
      await page.getByRole("button", { name: "New chat" }).click();
      await threadsAfter.first().click();
    }

    await expect(page).toHaveURL(/thread=/);
    await expect(composer).toBeVisible();
  });
});
