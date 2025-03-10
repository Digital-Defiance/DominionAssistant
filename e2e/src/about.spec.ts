import { test, expect } from '@playwright/test';
import {
  APP_FEATURES,
  APP_MINI_DISCLAIMER,
  APP_MINI_DISCLAIMER_NOTE,
  APP_TITLE,
} from '@/game/constants';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect the title to be "Unofficial Dominion Assistant".
  const title = await page.locator('h4').innerText();
  expect(title).toContain(APP_TITLE);
});

test('has features list', async ({ page }) => {
  await page.goto('/');

  for (const feature of APP_FEATURES) {
    await expect(page.locator(`text=${feature}`)).toBeVisible();
  }
});

test('has messages section', async ({ page }) => {
  await page.goto('/about');

  // Expect the messages section to be visible if there are messages.
  const messagesSection = page.locator('text=Messages');
  if ((await messagesSection.count()) > 0) {
    await expect(messagesSection).toBeVisible();
  }
});

test('has version number', async ({ page }) => {
  await page.goto('/about');

  // Expect the version number to be visible.
  const versionText = await page.locator('text=Version:').innerText();
  expect(versionText).toContain('Version:');
});

test('has about section', async ({ page }) => {
  await page.goto('/about');
  const aboutText = [
    'This application is created by',
    'Digital Defiance',
    'Jessica Mulein',
    APP_MINI_DISCLAIMER,
    'For more information, contributions, or to report issues',
    APP_MINI_DISCLAIMER_NOTE,
    'See our Disclaimer for End Users for important information.',
    'User Manual',
  ];

  for (const text of aboutText) {
    await expect(page.locator(`text=${text}`)).toBeVisible();
  }
});
