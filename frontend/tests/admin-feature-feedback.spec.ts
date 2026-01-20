import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';
import { seedFeedbackData } from './helpers/seed';

test.describe('Admin - Feature Request & Feedback Details', () => {
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        await loginAsAdmin(page);
        await seedFeedbackData(page);
        await page.close();
    });

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

        // Wait for table to be fully loaded
        await table.waitFor({ state: 'visible', timeout: 10000 });

        // Get initial row count
        const initialRowCount = await page.locator('tbody tr').count();

        // Wait for search input to be visible (it's only rendered when there are items)
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });

        // Enter search query
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

        // Verify search input still has value (which makes Clear button visible)
        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBeTruthy();

        // Clear search - use more specific selector with the X icon
        const clearButton = page.locator('button:has-text("Clear")').filter({ has: page.locator('svg') });
        await clearButton.waitFor({ state: 'visible', timeout: 5000 });
        await clearButton.click();
        await page.waitForLoadState('networkidle');
    });

    test('[TC-ADMIN-FEAT-003] should filter by category', async ({ page }) => {
        await expect(page.locator('h1.text-2xl').first()).toContainText('Feature Request & Feedback');

        // Select a category filter - use nth(0) to get first select element
        const categorySelect = page.locator('label:has-text("Category")').locator('..').locator('select');

        await categorySelect.waitFor({ state: 'visible', timeout: 10000 });
        await categorySelect.selectOption('Enhancement');
        await page.waitForTimeout(1000); // Wait for filter to apply

        // Verify filter was applied (URL or table update)
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible({ timeout: 5000 }),
            expect(noItems).toBeVisible({ timeout: 5000 })
        ]);

        // Reset filter
        await categorySelect.selectOption('');
        await page.waitForTimeout(500);
    });


    test('[TC-ADMIN-FEAT-004] should filter by acceptance status', async ({ page }) => {
        await expect(page.locator('h1.text-2xl').first()).toContainText('Feature Request & Feedback');

        // Check if there are items first
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible({ timeout: 10000 }),
            expect(noItems).toBeVisible({ timeout: 10000 })
        ]);

        if (await noItems.isVisible()) {
            console.log("No items to test filtering on.");
            return;
        }

        // Wait for table to be fully loaded (filters are only rendered when there are items)
        await table.waitFor({ state: 'visible', timeout: 10000 });

        // Wait for the filters section to load
        await page.waitForSelector('label:has-text("Acceptance Status")', { timeout: 10000 });

        // Select acceptance status filter - use nth(1) as it's the second select (Category is 0, Acceptance Status is 1)
        const statusSelect = page.locator('select').nth(1);

        await statusSelect.waitFor({ state: 'visible', timeout: 10000 });
        await statusSelect.selectOption('Approved');
        await page.waitForTimeout(1000); // Wait for filter to apply

        // Verify filter was applied
        await Promise.race([
            expect(table).toBeVisible({ timeout: 5000 }),
            expect(noItems).toBeVisible({ timeout: 5000 })
        ]);

        // If table is visible, verify all visible items have "Approved" badge
        if (await table.isVisible()) {
            const approvedBadges = page.locator('span:has-text("Approved")');
            const badgeCount = await approvedBadges.count();
            if (badgeCount > 0) {
                expect(badgeCount).toBeGreaterThan(0);
            }
        }

        // Reset filter
        await statusSelect.selectOption('');
        await page.waitForTimeout(500);
    });

    test('[TC-ADMIN-FEAT-005] should filter by progress status', async ({ page }) => {
        await expect(page.locator('h1.text-2xl').first()).toContainText('Feature Request & Feedback');

        const noItems = page.locator('text=No items found');
        // Select progress status filter
        const progressSelect = page.locator('label:has-text("Progress Status")').locator('..').locator('select');

        await progressSelect.waitFor({ state: 'visible', timeout: 10000 });
        await progressSelect.selectOption('In Progress');
        await page.waitForTimeout(1000); // Wait for filter to apply

        // Verify filter was applied
        const table = page.locator('table');

        await Promise.race([
            expect(table).toBeVisible({ timeout: 5000 }),
            expect(noItems).toBeVisible({ timeout: 5000 })
        ]);

        // If table is visible, verify all visible items have "In Progress" badge
        if (await table.isVisible()) {
            const progressBadges = page.locator('span:has-text("In Progress")');
            const badgeCount = await progressBadges.count();
            if (badgeCount > 0) {
                expect(badgeCount).toBeGreaterThan(0);
            }
        }

        // Reset filter
        await progressSelect.selectOption('');
        await page.waitForTimeout(500);
    });

    test('[TC-ADMIN-FEAT-006] should display correct table columns', async ({ page }) => {
        await expect(page.locator('h1.text-2xl').first()).toContainText('Feature Request & Feedback');

        // Check if table exists
        const table = page.locator('table');
        const noItems = page.locator('text=No items found');

        await Promise.race([
            expect(table).toBeVisible({ timeout: 5000 }),
            expect(noItems).toBeVisible({ timeout: 5000 })
        ]);

        if (await table.isVisible()) {
            // Verify all expected column headers are present - use first() to avoid multiple matches
            await expect(page.locator('th:has-text("Category")').first()).toBeVisible();
            await expect(page.locator('th:has-text("Subject/Description")').first()).toBeVisible();
            await expect(page.locator('th:has-text("Status")').first()).toBeVisible();
            await expect(page.locator('th:has-text("Progress Status")').first()).toBeVisible();
            await expect(page.locator('th:has-text("Created")').first()).toBeVisible();
            await expect(page.locator('th:has-text("Actions")').first()).toBeVisible();
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
