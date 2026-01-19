import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin - Symbols Master', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/symbols');
        await page.waitForLoadState('networkidle');
    });

    test('should display symbols master page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Symbols Master/i })).toBeVisible({ timeout: 10000 });

        // Check for core action buttons
        await expect(page.getByRole('button', { name: /Upload Symbols/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Status/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Reload Series/i })).toBeVisible();
    });

    test('should open upload symbols modal', async ({ page }) => {
        await page.getByRole('button', { name: /Upload Symbols/i }).click();
        await expect(page.getByRole('heading', { name: /Upload Symbols/i })).toBeVisible();

        // Verify modal has essential fields
        await expect(page.getByText(/Select Symbol File/i)).toBeVisible();

        // Close modal
        await page.getByRole('button', { name: /Cancel/i }).first().click();
        await expect(page.getByRole('heading', { name: /Upload Symbols/i })).not.toBeVisible();
    });

    test('should open status modal', async ({ page }) => {
        await page.getByRole('button', { name: /Status/i }).click();
        await expect(page.getByText(/Recent Upload Jobs/i)).toBeVisible();

        // Close modal
        await page.locator('button:has(svg.lucide-x)').first().click();
    });

    test('should search and filter symbols', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Search symbols/i);
        await searchInput.fill('RELIANCE');
        await page.getByRole('button', { name: /Search/i }).click();

        // Wait for search
        await page.waitForTimeout(1000);

        // Even if no data, the search query should persist or table headers should stay
        await expect(page.locator('table')).toBeVisible();
    });
});
