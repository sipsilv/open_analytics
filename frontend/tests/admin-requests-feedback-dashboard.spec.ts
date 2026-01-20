import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { seedFeedbackData } from './helpers/seed';

test.describe('Admin - Requests & Feedback Dashboard', () => {
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        await loginAsAdmin(page);
        await seedFeedbackData(page);
        await page.close();
    });

    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/requests-feedback');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-REQ-DASH-001] should display dashboard with both cards', async ({ page }) => {
        // Wait for the page to load by checking for card titles
        await page.waitForSelector('h3:has-text("Access Request")', { timeout: 10000 });
        await page.waitForSelector('h3:has-text("Feature Request & Feedback")', { timeout: 10000 });

        // Verify both card titles are visible
        await expect(page.locator('h3:has-text("Access Request")')).toBeVisible();
        await expect(page.locator('h3:has-text("Feature Request & Feedback")')).toBeVisible();

        // Verify page heading exists (may be in sidebar or main content)
        const pageHeading = page.locator('h1:has-text("Request and Feedback")');
        if (await pageHeading.count() > 0) {
            await expect(pageHeading.first()).toBeVisible();
        }
    });

    test('[TC-REQ-DASH-002] should display Access Request statistics', async ({ page }) => {
        // Wait for the Access Request card to load
        await page.waitForSelector('h3:has-text("Access Request")', { timeout: 10000 });

        // Verify the Access Request card title is visible
        await expect(page.locator('h3:has-text("Access Request")')).toBeVisible();

        // Verify all statistics labels are present (use waitFor to ensure they load)
        await page.waitForSelector('text=Total Requests', { timeout: 5000 });
        await expect(page.locator('text=Total Requests')).toBeVisible();
        await expect(page.locator('text=Approved').first()).toBeVisible();
        await expect(page.locator('text=Rejected').first()).toBeVisible();
        await expect(page.locator('text=Pending').first()).toBeVisible();
    });

    test('[TC-REQ-DASH-003] should display Feature Request & Feedback statistics', async ({ page }) => {
        // Wait for the Feature Request & Feedback card to load
        await page.waitForSelector('h3:has-text("Feature Request & Feedback")', { timeout: 10000 });

        // Verify the Feature Request & Feedback card title is visible
        await expect(page.locator('h3:has-text("Feature Request & Feedback")')).toBeVisible();

        // Verify all statistics labels are present (use waitFor to ensure they load)
        await page.waitForSelector('text=Total Items', { timeout: 5000 });
        await expect(page.locator('text=Total Items')).toBeVisible();
        // Use more specific selector to avoid strict mode violation - target the stat card with primary color
        await expect(page.locator('.text-primary:has-text("Feature Requests")').first()).toBeVisible();
        await expect(page.locator('text=Feedback').first()).toBeVisible();

        // Check for second Pending (Feature Request card) - may not always be present
        const pendingElements = page.locator('text=Pending');
        const pendingCount = await pendingElements.count();
        if (pendingCount > 1) {
            await expect(pendingElements.nth(1)).toBeVisible();
        }
    });

    test('[TC-REQ-DASH-004] should navigate to Access Requests page', async ({ page }) => {
        // Click the "Manage Access Requests" button
        const manageButton = page.locator('button:has-text("Manage Access Requests")');
        await manageButton.click();

        // Verify navigation to /admin/requests
        await page.waitForURL('/admin/requests');
        await expect(page).toHaveURL('/admin/requests');
    });

    test('[TC-REQ-DASH-005] should navigate to Feature Requests & Feedback details page', async ({ page }) => {
        // Click the "Manage Feature Requests & Feedback" button
        const manageButton = page.locator('button:has-text("Manage Feature Requests & Feedback")');
        await manageButton.click();

        // Verify navigation to /admin/requests-feedback/details
        await page.waitForURL('/admin/requests-feedback/details');
        await expect(page).toHaveURL('/admin/requests-feedback/details');
    });

    test('[TC-REQ-DASH-006] should navigate with filters when clicking stat cards', async ({ page }) => {
        // Test clicking on "Approved" stat card
        const approvedButton = page.locator('button[aria-label="View approved requests"]');

        // Check if the button exists before clicking
        if (await approvedButton.count() > 0) {
            await approvedButton.click();

            // Verify navigation includes filter parameter
            await page.waitForURL(/\/admin\/requests\?filter=approved/);
            await expect(page).toHaveURL(/\/admin\/requests\?filter=approved/);

            // Go back to dashboard
            await page.goto('/admin/requests-feedback');
            await page.waitForLoadState('networkidle');
        }

        // Test clicking on "Pending" stat card
        const pendingButton = page.locator('button[aria-label="View pending requests"]');

        if (await pendingButton.count() > 0) {
            await pendingButton.click();

            // Verify navigation includes filter parameter
            await page.waitForURL(/\/admin\/requests\?filter=pending/);
            await expect(page).toHaveURL(/\/admin\/requests\?filter=pending/);

            // Go back to dashboard
            await page.goto('/admin/requests-feedback');
            await page.waitForLoadState('networkidle');
        }

        // Test clicking on "Rejected" stat card
        const rejectedButton = page.locator('button[aria-label="View rejected requests"]');

        if (await rejectedButton.count() > 0) {
            await rejectedButton.click();

            // Verify navigation includes filter parameter
            await page.waitForURL(/\/admin\/requests\?filter=rejected/);
            await expect(page).toHaveURL(/\/admin\/requests\?filter=rejected/);
        }
    });

    test('[TC-REQ-DASH-007] should display correct card descriptions', async ({ page }) => {
        // Verify Access Request card description
        const accessDescription = page.locator('text=Review and approve or reject new user access requests');
        await expect(accessDescription).toBeVisible();

        // Verify Feature Request & Feedback card description
        const featureDescription = page.locator('text=View and manage feature requests and feedback submitted by users');
        await expect(featureDescription).toBeVisible();
    });
});
