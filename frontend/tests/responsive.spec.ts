import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Responsive Layout', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('should show permanent sidebar on desktop', async ({ page }) => {
        // Set desktop viewport
        await page.setViewportSize({ width: 1280, height: 720 });

        // Sidebar should be visible and not a fixed overlay in the same way
        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();

        // Mobile header should be hidden
        const mobileHeader = page.locator('header.lg\\:hidden');
        await expect(mobileHeader).not.toBeVisible();
    });

    test('should show mobile header and hidden sidebar on mobile', async ({ page }) => {
        // Set mobile viewport (iPhone 13)
        await page.setViewportSize({ width: 390, height: 844 });
        await page.reload(); // Ensure layout triggers
        await page.waitForLoadState('networkidle');

        // Mobile header should be visible
        const mobileHeader = page.locator('header.lg\\:hidden');
        await expect(mobileHeader).toBeVisible();

        // Sidebar should be hidden (translated off-screen)
        const sidebar = page.locator('aside');
        // Check for translation or visibility based on our implementation
        // In our case, it's -translate-x-full
        const boundingBox = await sidebar.boundingBox();
        if (boundingBox) {
            expect(boundingBox.x).toBeLessThan(0);
        }
    });

    test('should open and close mobile drawer', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 390, height: 844 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Click hamburger menu
        await page.getByLabel(/Open menu/i).click();

        // Sidebar should now be visible (translated 0)
        const sidebar = page.locator('aside');
        const boundingBox = await sidebar.boundingBox();
        if (boundingBox) {
            expect(boundingBox.x).toBe(0);
        }

        // Click backdrop to close
        await page.locator('.fixed.inset-0.bg-black\\/50').click();

        // Sidebar should be hidden again
        const closedBoundingBox = await sidebar.boundingBox();
        if (closedBoundingBox) {
            expect(closedBoundingBox.x).toBeLessThan(0);
        }
    });
});
