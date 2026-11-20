import { test, expect } from '@playwright/test';
import { setupMockEnvironment } from './helpers/mockApi';

test.describe('Module 3: Category Manager, Mobile 2-Column 3-Dots UX & Stacked ESC Key', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: true });
    await page.goto('/');
  });

  test('TC-CAT-01: Create a new Category with custom HEX color', async ({ page }) => {
    await page.getByTitle('Manage Categories').click();
    await expect(page.getByText('Manage Notebook Categories')).toBeVisible();

    const nameInput = page.getByPlaceholder('Category name...');
    await nameInput.fill('DevOps');

    const hexInput = page.getByPlaceholder('HEX');
    await hexInput.fill('FD7E14');

    const addBtn = page.locator('.cat-manager-submit-btn:visible');
    await expect(addBtn).toBeEnabled();
    await addBtn.click();

    await expect(page.locator('.cat-item-badge', { hasText: 'DevOps' })).toBeVisible();
  });

  test('TC-CAT-02: Edit Category enforces Dirty Check and Stacked Escape Key isolation', async ({ page }) => {
    await page.getByTitle('Manage Categories').click();
    await expect(page.getByText('Manage Notebook Categories')).toBeVisible();

    const frontendItem = page.locator('.cat-item-card', { hasText: 'Frontend' });
    const isMobile = (page.viewportSize()?.width || 1280) < 768;

    if (isMobile) {
      await frontendItem.locator('.cat-item-more-btn').click();
      await page.locator('.cat-item-mobile-menu').getByRole('button', { name: 'Edit' }).click();
    } else {
      await frontendItem.getByTitle('Edit').click();
    }

    // Update button should be disabled before making changes
    const updateBtn = page.locator('.cat-manager-submit-btn:visible');
    await expect(updateBtn).toBeDisabled();

    // Change name -> Update button becomes enabled
    await page.getByPlaceholder('Category name...').fill('Frontend UI');
    await expect(updateBtn).toBeEnabled();
    await updateBtn.click();

    // Update Category Confirmation Modal opens on top
    await expect(page.getByText('Update Category?')).toBeVisible();

    // Press Escape -> ONLY the top-most confirmation modal closes; Manage Notebook Categories stays open!
    await page.keyboard.press('Escape');
    await expect(page.getByText('Update Category?')).toBeHidden();
    await expect(page.getByText('Manage Notebook Categories')).toBeVisible();

    // Confirm update
    await updateBtn.click();
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Update' }).click();
    await expect(page.locator('.cat-item-badge', { hasText: 'Frontend UI' })).toBeVisible();
  });

  test('TC-CAT-03: Mobile Viewport (375x812) renders 2-column categories with 3-dots (⋮) floating portal menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByTitle('Manage Categories').click();

    // Verify 2-column grid (col-6) and 3-dots trigger button is visible on mobile
    const firstCol = page.locator('.cat-manager-grid > .col-6').first();
    await expect(firstCol).toBeVisible();

    const moreBtn = firstCol.locator('.cat-item-more-btn');
    await expect(moreBtn).toBeVisible();
    await moreBtn.click();

    // Floating dropdown menu should render in portal with Hide, Edit, Delete actions
    const mobileMenu = page.locator('.cat-item-mobile-menu');
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Hide' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(mobileMenu.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Trigger Hide action and confirm
    await mobileMenu.getByRole('button', { name: 'Hide' }).click();
    await expect(page.getByText('Hide Category?')).toBeVisible();
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Hide' }).click();
    await expect(page.getByText('Hide Category?')).toBeHidden();
  });
});

