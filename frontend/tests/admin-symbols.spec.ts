import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin - Symbols Master', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/symbols');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-SYM-001] should display symbols master page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Symbols Master/i })).toBeVisible({ timeout: 10000 });

        // Check for core action buttons
        await expect(page.getByRole('button', { name: /Upload Symbols/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Status/i }).first()).toBeVisible();
        await expect(page.getByRole('button', { name: /Reload Series/i }).first()).toBeVisible();
    });

    test('[TC-ADMIN-SYM-002] should open upload symbols modal', async ({ page }) => {
        await page.getByRole('button', { name: /Upload Symbols/i }).first().click();
        const modalHeading = page.locator('#upload-symbols-modal-heading');
        await expect(modalHeading).toBeVisible({ timeout: 10000 });

        // Verify modal has essential fields - using explicit ID for robustness
        await expect(page.locator('#symbol-file-input')).toBeAttached();
        await expect(page.getByText(/Click to select file/i)).toBeVisible();

        // Close modal
        await page.getByRole('button', { name: /Cancel/i }).first().click();
        await expect(modalHeading).not.toBeVisible();
    });

    test('[TC-ADMIN-SYM-003] should open status modal', async ({ page }) => {
        await page.getByRole('button', { name: /Status/i }).first().click();
        const statusHeading = page.locator('#upload-status-modal-heading');
        await expect(statusHeading).toBeVisible({ timeout: 10000 });

        // Close modal
        const closeButton = page.locator('#upload-status-modal-close-button');
        await closeButton.scrollIntoViewIfNeeded();
        await closeButton.click({ force: true });
        await expect(statusHeading).not.toBeVisible();
    });

    test('[TC-ADMIN-SYM-004] should search and filter symbols', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Search symbols/i);
        await searchInput.fill('RELIANCE');
        await page.getByRole('button', { name: /Search/i }).click();

        // Wait for search
        await page.waitForTimeout(1000);

        // Even if no data, the search query should persist or table headers should stay
        await expect(page.locator('table')).toBeVisible();
    });
});
