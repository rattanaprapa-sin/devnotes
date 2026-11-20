import { test, expect } from '@playwright/test';
import { setupMockEnvironment } from './helpers/mockApi';

test.describe('Module 1: Authentication, Profile, Theme & Sign Out', () => {
  test('TC-AUTH-01: Unauthenticated user is redirected to /login and can see Sign In / Sign Up tabs', async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: false });
    await page.goto('/');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'DevNotes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' }).first()).toBeVisible();
  });

  test('TC-AUTH-02: Login displays error message on invalid credentials', async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: false });
    await page.goto('/login');

    await page.getByPlaceholder('name@example.com').fill('developer@devnotes.app');
    await page.getByPlaceholder('••••••••').first().fill('wrongpassword');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText('Incorrect email or password. Please try again.')).toBeVisible();
  });

  test('TC-AUTH-03: Sign Up form validates password mismatch', async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: false });
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign Up' }).first().click();
    await page.getByPlaceholder('How should we call you?').fill('Tong Dev');
    await page.getByPlaceholder('name@example.com').fill('newuser@devnotes.app');

    const passwordInputs = page.getByPlaceholder('••••••••');
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('password999');
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('TC-AUTH-04: User Guide modal opens from navbar (?) button and closes on Escape', async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: true });
    await page.goto('/');

    await page.getByTitle('DevNotes Guide').click();
    await expect(page.getByRole('heading', { name: 'DevNotes Guide' })).toBeVisible();
    await expect(page.getByText('Markdown Cheatsheet')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'DevNotes Guide' })).toBeHidden();
  });

  test('TC-AUTH-05: Theme switcher toggles between Light, Blue, and Dark mode', async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: true });
    await page.goto('/');

    // Open profile dropdown
    await page.locator('.app-navbar-profile-btn').click();
    await expect(page.getByText('Theme')).toBeVisible();

    // Switch to Night Mode (Dark)
    await page.getByTitle('Night Mode').click();
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');

    // Switch to Blue Mode
    await page.getByTitle('Blue Mode').click();
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'blue');

    // Switch back to Day Mode (Light)
    await page.getByTitle('Day Mode').click();
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'light');
  });

  test('TC-AUTH-06: Sign Out requires confirmation modal before logging out', async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: true });
    await page.goto('/');

    await page.locator('.app-navbar-profile-btn').click();
    await page.getByRole('button', { name: /Sign Out/i }).click();

    // Verify Confirmation Modal appears
    await expect(page.getByText('Sign Out?')).toBeVisible();
    await expect(page.getByText('Are you sure you want to sign out of your account?')).toBeVisible();

    // Cancel sign out keeps user on Dashboard
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Sign Out?')).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });
});
