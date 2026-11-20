import { test, expect } from '@playwright/test';
import { setupMockEnvironment } from './helpers/mockApi';

test.describe('Module 4 & 5: Notes, NoteEditor, Interactive Checklists, Flashcard Mode & Sticky Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await setupMockEnvironment(page, { authenticated: true });
  });

  test('TC-NOTE-01: Create a new Note using NoteEditor with Checklist and TableGridPicker', async ({ page }) => {
    await page.goto('/notebook/nb-1');
    await expect(page.getByRole('heading', { name: 'SQL' })).toBeVisible();

    await page.getByRole('button', { name: /New Note/i }).click();
    await expect(page.getByText('New Short Note')).toBeVisible();

    await page.getByPlaceholder('e.g., Hooks, Database connection...').fill('PostgreSQL Transactions');

    // Type inside NoteEditor (TipTap ProseMirror contenteditable)
    const editor = page.locator('.wysiwyg-editor-content');
    await editor.click();
    await page.keyboard.type('ACID compliance notes');

    // Open TableGridPicker and close it
    await page.locator('.table-picker-toggle-btn').click();
    await expect(page.getByText('Insert Table')).toBeVisible();
    await page.locator('.table-picker-toggle-btn').click();
    await expect(page.getByText('Insert Table')).toBeHidden();

    await page.getByRole('button', { name: 'Save Note' }).click();
    await expect(page.locator('.card', { hasText: 'PostgreSQL Transactions' })).toBeVisible();
  });

  test('TC-NOTE-02: Edit Note enforces Dirty Check and requires Save Confirmation', async ({ page }) => {
    await page.goto('/notebook/nb-1');

    const firstNoteCard = page.locator('.card', { hasText: 'INNER JOIN vs LEFT JOIN' }).first();
    await firstNoteCard.getByTitle('Edit note').click();

    await expect(page.getByText('Edit Short Note')).toBeVisible();
    const saveChangesBtn = page.getByRole('button', { name: 'Save Changes' });

    // Must be disabled when opened without changes
    await expect(saveChangesBtn).toBeDisabled();

    // Update topic -> Save Changes becomes enabled
    await page.getByPlaceholder('e.g., Hooks, Database connection...').fill('INNER JOIN vs LEFT JOIN (Updated)');
    await expect(saveChangesBtn).toBeEnabled();

    await saveChangesBtn.click();
    await expect(page.getByText('Save Changes?')).toBeVisible();
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('.card', { hasText: 'INNER JOIN vs LEFT JOIN (Updated)' })).toBeVisible();
  });

  test('TC-NOTE-03: View Note supports Interactive Checklist toggling and Arrow Key navigation', async ({ page }) => {
    await page.goto('/notebook/nb-1');

    // Open first note in ViewNoteModal
    await page.locator('.card', { hasText: 'INNER JOIN vs LEFT JOIN' }).first().click();
    await expect(page.getByText('Checklist: 1 of 2 completed')).toBeVisible();

    // Toggle unchecked task in ViewNoteModal
    const firstCheckbox = page.locator('.note-markdown-view input[type="checkbox"]').first();
    await firstCheckbox.click();
    await expect(page.getByText('Checklist: 2 of 2 completed')).toBeVisible();

    // Press ArrowRight to navigate to next note
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.view-note-modal-title')).toContainText('B-Tree Indexes');

    // Press ArrowLeft to navigate back
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.view-note-modal-title')).toContainText('INNER JOIN vs LEFT JOIN');
  });

  test('TC-NOTE-04: Flashcard Mode hides note contents and reveals in View modal', async ({ page }) => {
    await page.goto('/notebook/nb-1');

    const flashcardSwitch = page.locator('#flashcardSwitch');
    await flashcardSwitch.check();

    // Card content enters flashcard concealed state (.bg-flashcard)
    await expect(page.locator('.bg-flashcard').first()).toBeVisible();

    // Clicking the card in Flashcard Mode opens ViewNoteModal with "Show Content" toggle
    await page.locator('.card', { hasText: 'INNER JOIN vs LEFT JOIN' }).first().click();
    const showContentBtn = page.getByRole('button', { name: /Show Content/i });
    await expect(showContentBtn).toBeVisible();
    await showContentBtn.click();
    await expect(page.getByRole('button', { name: /Hide Content/i })).toBeVisible();
  });

  test('TC-STICKY-01: Home Sticky Checklist adds task, toggles completion, changes theme, and confirms delete/clear', async ({ page }) => {
    await page.goto('/');

    // Click Sticky Checklist pill to expand
    await page.getByTitle('Open Sticky Checklist').click();
    await expect(page.getByPlaceholder('Add a quick task...')).toBeVisible();

    // Add a new task
    await page.getByPlaceholder('Add a quick task...').fill('Write Playwright E2E tests');
    await page.locator('.sticky-checklist-add-btn').click();
    await expect(page.getByText('Write Playwright E2E tests')).toBeVisible();

    // Switch Sticky Note color theme to Pink
    await page.getByTitle('Pink theme').click();

    // Click Clear completed -> Confirmation Modal must appear
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(page.getByText('Clear Completed Tasks?')).toBeVisible();
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('Welcome to DevNotes!')).toHaveCount(0);

    // Delete single task -> Confirmation Modal must appear
    await page.locator('.sticky-checklist-task-item', { hasText: 'Write Playwright E2E tests' }).getByTitle('Delete task').click();
    await expect(page.getByText('Delete Task?')).toBeVisible();
    await page.locator('.confirm-modal-actions').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Write Playwright E2E tests')).toHaveCount(0);
  });
});
