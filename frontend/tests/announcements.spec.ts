import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Announcements', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/announcements');
        await page.waitForLoadState('networkidle');
    });

    test('should display corporate announcements page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Corporate Announcements/i })).toBeVisible({ timeout: 10000 });

        // Check for status badge
        await expect(page.getByText(/LIVE|OFFLINE/i)).toBeVisible();

        // Check for search input
        await expect(page.getByPlaceholder(/Search by headline or symbol/i)).toBeVisible();

        // Check for table
        await expect(page.locator('table')).toBeVisible();
    });

    test('should search announcements', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Search by headline or symbol/i);
        await searchInput.fill('DIVIDEND');
        await page.getByRole('button', { name: /Search/i }).click();

        // Wait for search
        await page.waitForTimeout(1000);

        // Verify table is still present (results might be empty but table structure persists)
        await expect(page.locator('table')).toBeVisible();
    });

    test('should filter by date', async ({ page }) => {
        // There are two date inputs. They don't have IDs or labels in the code snippet I saw, 
        // but they are inside the filter div.
        // Let's use type="date"
        const dateInputs = page.locator('input[type="date"]');
        await expect(dateInputs).toHaveCount(2);

        await dateInputs.first().fill('2024-01-01');
        await dateInputs.last().fill('2024-12-31');

        await page.getByRole('button', { name: /Search/i }).click();
        await page.waitForTimeout(1000);
        await expect(page.locator('table')).toBeVisible();
    });
});
