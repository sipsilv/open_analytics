import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('User Feedback & Feature Requests', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/feature-feedback/unified');
        await page.waitForLoadState('networkidle');
    });

    test('should display unified feedback page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Feature Requests & Feedback/i })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('button', { name: /Submit New/i })).toBeVisible();
    });

    test('should submit a feature request', async ({ page }) => {
        await page.getByRole('button', { name: /Submit New/i }).click();

        // Wait for modal
        await expect(page.getByRole('heading', { name: /Feature Requests & Feedback/i }).nth(1)).toBeVisible();

        // Fill the form
        await page.locator('select').first().selectOption('Enhancement');

        // The Input component for Title might not have a label that Playwright likes yet (Wait, I fixed Input.tsx!)
        // Let's check if UnifiedSubmitModal uses the new Input with id.
        // In UnifiedSubmitModal.tsx: 315: <Input ... id is NOT passed.
        // I should fix UnifiedSubmitModal too to use IDs for better testing.

        // For now, use placeholder
        await page.getByPlaceholder(/Brief, descriptive title/i).fill('Test Feature Request Title');
        await page.getByPlaceholder(/Describe the feature or improvement/i).fill('This is a test feature request description with more than 10 characters.');

        // Submit
        const submitButton = page.getByRole('button', { name: /Submit/i, exact: true });
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

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
