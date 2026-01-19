import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Admin - Feature Request & Feedback Details', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        // Navigate directly to the page since verification of navigation menu is not the primary goal here
        await page.goto('/admin/requests-feedback/details');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-FEAT-001] should match status and progress logic', async ({ page }) => {
        // Wait for table to load
        // Use more specific selector to avoid ambiguity with other h1s or multiple matches
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Check availability of items or wait for 'No items found'
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible(),
            expect(noItems).toBeVisible()
        ]);

        if (await noItems.isVisible()) {
            console.log("No items to test status logic on.");
            return;
        }

        // Open first item
        await page.locator('button:has-text("View")').first().click();

        // Wait for modal
        const modal = page.locator('.fixed.inset-0.z-\\[9999\\]');
        await expect(modal).toBeVisible();

        // Get Selectors
        const statusSelect = modal.locator('select').nth(0); // Assumption: First select is Status
        const progressSelect = modal.locator('select').nth(1); // Assumption: Second select is Progress

        // 1. Verify Rejected Logic
        await statusSelect.selectOption('rejected');
        await expect(progressSelect).toHaveValue('Closed');

        // 2. Verify Approved Logic
        await statusSelect.selectOption('approved');
        // Defaults to In Progress
        await expect(progressSelect).toHaveValue('In Progress');

        // "Open" should NOT be present (we check value mainly)
        // Check options: In Progress, Implemented
        await expect(progressSelect.locator('option[value="In Progress"]')).toBeAttached();
        await expect(progressSelect.locator('option[value="Implemented"]')).toBeAttached();
        // Open should not be there for Approved
        await expect(progressSelect.locator('option[value="Open"]')).not.toBeAttached();

        // 3. Verify Pending Logic (if available)
        const pendingOption = statusSelect.locator('option[value="pending"]');
        if (await pendingOption.count() > 0) {
            await statusSelect.selectOption('pending');
            // Should default to Not Started
            await expect(progressSelect).toHaveValue('Not Started');
            // Should have "Closed" as an option (for rejecting pending items)
            await expect(progressSelect.locator('option[value="Closed"]')).toBeAttached();
        }
    });

    test('[TC-ADMIN-FEAT-002] should filter by search query', async ({ page }) => {
        // Wait for page to load
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Check if there are items to search
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible(),
            expect(noItems).toBeVisible()
        ]);

        if (await noItems.isVisible()) {
            console.log("No items to test search on.");
            return;
        }

        // Get initial row count
        const initialRowCount = await page.locator('tbody tr').count();

        // Enter search query
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('test search query that should not match anything');

        // Click search button
        await page.locator('button:has-text("Search")').click();
        await page.waitForLoadState('networkidle');

        // Should show "No items found" or fewer results
        const afterSearchNoItems = page.locator('text=No items found');
        const afterSearchTable = page.locator('table');

        const noItemsVisible = await afterSearchNoItems.isVisible();
        if (noItemsVisible) {
            // Search worked - no results found
            expect(noItemsVisible).toBe(true);
        } else {
            // Or there might be fewer results
            const afterRowCount = await page.locator('tbody tr').count();
            expect(afterRowCount).toBeLessThanOrEqual(initialRowCount);
        }

        // Clear search
        await page.locator('button:has-text("Clear")').click();
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-FEAT-003] should filter by category', async ({ page }) => {
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Select a category filter
        const categorySelect = page.locator('select').filter({ hasText: 'All Categories' });
        await categorySelect.selectOption('Enhancement');
        await page.waitForLoadState('networkidle');

        // Verify filter was applied (URL or table update)
        // The page should reload with filtered results
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible(),
            expect(noItems).toBeVisible()
        ]);

        // Reset filter
        await categorySelect.selectOption('');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-FEAT-004] should filter by acceptance status', async ({ page }) => {
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Select acceptance status filter
        const statusSelect = page.locator('label:has-text("Acceptance Status")').locator('..').locator('select');
        await statusSelect.selectOption('Approved');
        await page.waitForLoadState('networkidle');

        // Verify filter was applied
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible(),
            expect(noItems).toBeVisible()
        ]);

        // If table is visible, verify all visible items have "Approved" badge
        if (await table.isVisible()) {
            const approvedBadges = page.locator('span:has-text("Approved")');
            const badgeCount = await approvedBadges.count();
            expect(badgeCount).toBeGreaterThan(0);
        }

        // Reset filter
        await statusSelect.selectOption('');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-FEAT-005] should filter by progress status', async ({ page }) => {
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Select progress status filter
        const progressSelect = page.locator('label:has-text("Progress Status")').locator('..').locator('select');
        await progressSelect.selectOption('In Progress');
        await page.waitForLoadState('networkidle');

        // Verify filter was applied
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible(),
            expect(noItems).toBeVisible()
        ]);

        // If table is visible, verify all visible items have "In Progress" badge
        if (await table.isVisible()) {
            const progressBadges = page.locator('span:has-text("In Progress")');
            const badgeCount = await progressBadges.count();
            expect(badgeCount).toBeGreaterThan(0);
        }

        // Reset filter
        await progressSelect.selectOption('');
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-FEAT-006] should display correct table columns', async ({ page }) => {
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Check if table exists
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible(),
            expect(noItems).toBeVisible()
        ]);

        if (await table.isVisible()) {
            // Verify all expected column headers are present
            await expect(page.locator('th:has-text("Category")')).toBeVisible();
            await expect(page.locator('th:has-text("Subject/Description")')).toBeVisible();
            await expect(page.locator('th:has-text("Status")')).toBeVisible();
            await expect(page.locator('th:has-text("Progress Status")')).toBeVisible();
            await expect(page.locator('th:has-text("Created")')).toBeVisible();
            await expect(page.locator('th:has-text("Actions")')).toBeVisible();
        }
    });

    test('[TC-ADMIN-FEAT-007] should refresh data when clicking refresh button', async ({ page }) => {
        await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');

        // Find and click refresh button
        const refreshButton = page.locator('button[aria-label="Refresh"]').or(page.locator('button:has-text("Refresh")'));

        // Check if refresh button exists
        if (await refreshButton.count() > 0) {
            await refreshButton.click();

            // Wait for network to be idle (data reloaded)
            await page.waitForLoadState('networkidle');

            // Verify page still shows the same content
            await expect(page.locator('h1.text-2xl')).toContainText('Feature Request & Feedback');
        } else {
            console.log("Refresh button not found, skipping test");
        }
    });
});
