import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('User Feedback & Feature Requests', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/feature-feedback/unified');
        await page.waitForLoadState('networkidle');
    });

    test('should display unified feedback page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Feature Requests & Feedback/i }).first()).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('button', { name: /Submit New/i })).toBeVisible();
    });

    test('should submit a feature request', async ({ page }) => {
        await page.getByRole('button', { name: /Submit New/i }).click();

        // Wait for modal using explicit ID
        const modalHeading = page.locator('#unified-submit-modal-heading');
        await expect(modalHeading).toBeVisible({ timeout: 10000 });

        // Fill the form using labels
        await page.getByLabel(/Category/i).selectOption('Enhancement');
        await page.getByLabel(/Title/i).fill('Test Feature Request Title');
        await page.getByLabel(/Description/i).fill('This is a test feature request description with more than 10 characters.');

        // Submit - scroll into view and use force click if needed due to modal overlays
        const submitButton = page.locator('#unified-submit-button');
        await expect(submitButton).toBeEnabled();
        await submitButton.scrollIntoViewIfNeeded();
        await submitButton.click({ force: true });

        // Success message
        await expect(page.getByText(/Feature Request Submitted/i)).toBeVisible({ timeout: 10000 });
    });

    test('should search and filter feedback', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Search by description/i);
        await searchInput.fill('test');
        await page.getByRole('button', { name: /Search/i }).click();

        await page.waitForTimeout(1000);
        // Even if no items, table or "You haven't submitted" message should be present
        const emptyState = page.getByText(/You haven't submitted any feature requests/i);
        const table = page.locator('table');

        const isVisible = await emptyState.isVisible() || await table.isVisible();
        expect(isVisible).toBeTruthy();
    });
});
