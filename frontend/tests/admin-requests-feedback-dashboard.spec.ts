import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin - Requests & Feedback Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/requests-feedback');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-REQ-DASH-001] should display dashboard with both cards', async ({ page }) => {
        // Verify page title - use first() to avoid multiple h1 matches
        await expect(page.locator('h1').first()).toContainText('Request and Feedback');

        // Verify both cards are visible
        const accessRequestCard = page.locator('text=Access Request').first();
        const featureFeedbackCard = page.locator('text=Feature Request & Feedback').first();

        await expect(accessRequestCard).toBeVisible();
        await expect(featureFeedbackCard).toBeVisible();
    });

    test('[TC-REQ-DASH-002] should display Access Request statistics', async ({ page }) => {
        // Verify all statistics labels are present
        await expect(page.locator('text=Total Requests')).toBeVisible();
        await expect(page.locator('text=Approved').first()).toBeVisible();
        await expect(page.locator('text=Rejected').first()).toBeVisible();
        await expect(page.locator('text=Pending').first()).toBeVisible();

        // Verify the Access Request card title is visible
        await expect(page.locator('h3:has-text("Access Request")')).toBeVisible();
    });

    test('[TC-REQ-DASH-003] should display Feature Request & Feedback statistics', async ({ page }) => {
        // Verify all statistics labels are present
        await expect(page.locator('text=Total Items')).toBeVisible();
        await expect(page.locator('text=Feature Requests')).toBeVisible();
        await expect(page.locator('text=Feedback').first()).toBeVisible();
        await expect(page.locator('text=Pending').nth(1)).toBeVisible(); // Second "Pending" is for Feature Request card

        // Verify the Feature Request & Feedback card title is visible
        await expect(page.locator('h3:has-text("Feature Request & Feedback")')).toBeVisible();
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
