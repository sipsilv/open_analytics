import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth';

test.describe('Role Based Access Control (RBAC)', () => {
    test('unauthenticated user should be redirected to login from dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/);
    });

    test('unauthenticated user should be redirected to login from admin routes', async ({ page }) => {
        await page.goto('/admin/accounts');
        await expect(page).toHaveURL(/\/login/);
    });

    test('admin user should have access to admin panel', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/accounts');
        await expect(page).toHaveURL(/\/admin\/accounts/);
        await expect(page.getByRole('heading', { name: /Accounts/i })).toBeVisible();
    });

    test('admin user should see admin links in sidebar', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/dashboard');

        // Admin should see "Admin" or specific admin links
        // Based on sidebar implementation, let's look for "Admin" text
        await expect(page.getByText(/Admin/i)).toBeVisible();
    });
});
