import { test, expect } from '@playwright/test';
import { setupMockEnvironment } from './helpers/mockApi';

test.describe('Module 2: Notebooks Management, Dirty Check & Confirmations', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: true });
    await page.goto('/');
  });

  test('TC-NB-01: Create a new Notebook with inline category creation', async ({ page }) => {
    await page.getByRole('button', { name: /New Notebook/i }).click();
    await expect(page.getByText('New Tool Note')).toBeVisible();

    const saveBtn = page.getByRole('button', { name: 'Save & Create' });
    await expect(saveBtn).toBeDisabled();

    await page.getByPlaceholder('Ex: React, Docker, Tailwind...').fill('Docker');
    await page.getByPlaceholder('What is this tool about?').fill('Containerization & Compose notes');
    await expect(saveBtn).toBeEnabled();

    await saveBtn.click();
    await expect(page.locator('.card', { hasText: 'Docker' })).toBeVisible();
  });

  test('TC-NB-02: Prevent duplicate Notebook name on create', async ({ page }) => {
    await page.getByRole('button', { name: /New Notebook/i }).click();
    await page.getByPlaceholder('Ex: React, Docker, Tailwind...').fill('SQL');
    await page.getByRole('button', { name: 'Save & Create' }).click();

    await expect(page.getByText('A notebook with this name already exists.')).toBeVisible();
  });

  test('TC-NB-03: Edit Notebook button "Save Changes" is disabled when no changes are made (Dirty Check)', async ({ page }) => {
    // Click edit button (pencil icon) on SQL card
    const sqlCard = page.locator('.card', { hasText: 'SQL' }).first();
    await sqlCard.locator('button:has(.bi-pencil-square)').click();

    await expect(page.getByText('Edit Tool Note')).toBeVisible();
    const saveChangesBtn = page.getByRole('button', { name: 'Save Changes' });

    // Must be disabled initially because nothing was modified
    await expect(saveChangesBtn).toBeDisabled();

    // Modify description -> Save Changes becomes enabled
    const descInput = page.getByPlaceholder('What is this tool about?');
    await descInput.fill('Updated SQL description with joins and subqueries');
    await expect(saveChangesBtn).toBeEnabled();

    // Click Save Changes -> Confirmation Modal appears
    await saveChangesBtn.click();
    await expect(page.getByText('Save Changes?')).toBeVisible();
    await expect(page.getByText('Are you sure you want to update')).toBeVisible();

    // Confirm save
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Edit Tool Note')).toBeHidden();
  });

  test('TC-NB-04: Delete Notebook requires Confirmation Modal and removes card on confirm', async ({ page }) => {
    const reactCard = page.locator('.card', { hasText: 'React.js' }).first();
    await reactCard.locator('button:has(.bi-trash3)').click();

    await expect(page.getByText('Delete Notebook?')).toBeVisible();
    await expect(page.getByText('All notes inside will be permanently deleted')).toBeVisible();

    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.card', { hasText: 'React.js' })).toHaveCount(0);
  });

  test('TC-NB-05: Filter Notebooks by Category pill', async ({ page }) => {
    await expect(page.locator('.card', { hasText: 'SQL' })).toBeVisible();
    await expect(page.locator('.card', { hasText: 'React.js' })).toBeVisible();

    // Filter by Database
    await page.locator('.category-filter-btn', { hasText: 'Database' }).click();
    await expect(page.locator('.card', { hasText: 'SQL' })).toBeVisible();
    await expect(page.locator('.card', { hasText: 'React.js' })).toHaveCount(0);

    // Reset to All Tools
    await page.locator('.category-filter-btn', { hasText: 'All Tools' }).click();
    await expect(page.locator('.card', { hasText: 'React.js' })).toBeVisible();
  });
});
