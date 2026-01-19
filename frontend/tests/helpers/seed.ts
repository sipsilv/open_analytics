import { Page, expect } from '@playwright/test';

/**
 * Seed feature requests and feedback via the UI
 */
export async function seedFeedbackData(page: Page) {
    console.log('Seeding feedback data via UI...');

    // Navigate to unified feedback page
    await page.goto('/feature-feedback/unified');
    await page.waitForLoadState('networkidle');

    // Check if we already have enough data to skip seeding
    // We check for at least 3 items
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    if (count >= 3) {
        console.log(`Found ${count} existing items. Skipping seed.`);
        return;
    }

    // Define items to create
    const items = [
        {
            category: 'Enhancement',
            title: 'Add Dark Mode Support',
            description: 'It would be great to have a dark mode for better night viewing. This helps reduce eye strain.',
            priority: 'Medium',
            type: 'feature_request'
        },
        {
            category: 'Bug Report',
            title: 'Login Page Layout Issue',
            description: 'The login page layout is broken on mobile devices. The input fields are overlapping.',
            priority: 'High',
            type: 'feedback',
            page: 'Login',
            steps: '1. Open on mobile\n2. Go to login\n3. Observe layout'
        },
        {
            category: 'Feature Request',
            title: 'Export to PDF',
            description: ' Ability to export dashboard reports to PDF format for sharing with stakeholders.',
            priority: 'Low',
            type: 'feature_request'
        }
    ];

    for (const item of items) {
        // Open modal
        const submitButton = page.locator('button:has-text("Submit New")');
        await submitButton.click();

        // Wait for modal
        await page.waitForSelector('h2:has-text("Feature Requests & Feedback")', { state: 'visible' });

        // Fill Category
        await page.selectOption('#feedback-category', item.category);

        // Fill Title
        await page.fill('#feedback-title', item.title);

        // Fill Description
        await page.fill('#feedback-description', item.description);

        // Fill Priority
        // Use simpler selector strategy since layouts can be complex
        // We find the label "Priority" and then the select following it
        // Or specific select by value if possible, but easier to just use label text locator logic if possible
        // The modal code shows "Priority" label followed by select
        const prioritySelect = page.locator('label:has-text("Priority")').locator('..').locator('select');
        if (await prioritySelect.isVisible()) {
            await prioritySelect.selectOption(item.priority);
        }

        // Fill Bug Report specific fields
        if (item.type === 'feedback' && item.category === 'Bug Report') {
            if (item.page) {
                await page.fill('input[placeholder*="e.g., Dashboard"]', item.page);
            }
            if (item.steps) {
                await page.fill('textarea[placeholder*="1. Go to..."]', item.steps);
            }
        }

        // Submit
        await page.click('#unified-submit-button');

        // Wait for success message
        await page.waitForSelector('text=Submitted!', { timeout: 10000 });

        // Close modal (it auto-closes after 2s but we can wait or verify it's gone)
        // The modal code says: setTimeout(() => { ... onClose() }, 2000)
        await page.waitForTimeout(2500);

        console.log(`Seeded: ${item.title}`);
    }

    // waiting for reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('Seeding complete.');
}
