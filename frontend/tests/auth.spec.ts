import { test, expect } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  identifier: 'admin',
  password: 'admin123',
};

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('[TC-AUTH-001] should display login page correctly', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check main heading - use heading role
    await expect(page.getByRole('heading', { name: 'OPEN ANALYTICS' })).toBeVisible({ timeout: 10000 });

    // Check form fields - use placeholder as fallback
    const identifierInput = page.locator('input[type="text"]').first();
    await expect(identifierInput).toBeVisible({ timeout: 10000 });

    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 10000 });

    const signInButton = page.locator('button:has-text("Sign In")');
    await expect(signInButton).toBeVisible({ timeout: 10000 });

    // Check links - use link role
    await expect(page.getByRole('link', { name: /Forgot password/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Contact admin/i })).toBeVisible({ timeout: 10000 });
  });

  test('[TC-AUTH-002] should login successfully with admin credentials', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForSelector('text=OPEN ANALYTICS', { timeout: 10000 });

    // Wait for form fields to be visible
    const identifierInput = page.getByLabel(/Email \/ Mobile \/ User ID/i);
    await identifierInput.waitFor({ state: 'visible', timeout: 10000 });
    await identifierInput.fill(ADMIN_CREDENTIALS.identifier);

    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(ADMIN_CREDENTIALS.password);

    // Submit form
    const signInButton = page.getByRole('button', { name: /Sign In/i });
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await signInButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Check that user is logged in (sidebar should be visible)
    await expect(page.getByText('OPEN ANALYTICS')).toBeVisible({ timeout: 10000 });
  });

  test('[TC-AUTH-003] should show error for invalid credentials', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForSelector('text=OPEN ANALYTICS', { timeout: 10000 });

    // Wait for form fields to be visible
    const identifierInput = page.getByLabel(/Email \/ Mobile \/ User ID/i);
    await identifierInput.waitFor({ state: 'visible', timeout: 10000 });
    await identifierInput.fill('invalid');

    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('wrongpassword');

    // Submit form
    const signInButton = page.getByRole('button', { name: /Sign In/i });
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await signInButton.click();

    // Should show error message
    // Match either "Invalid" or "Incorrect" - backend uses "Incorrect identifier or password"
    await expect(page.getByText(/Invalid|Incorrect identifier or password/i)).toBeVisible({ timeout: 10000 });

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('[TC-AUTH-004] should login with email', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForSelector('text=OPEN ANALYTICS', { timeout: 10000 });

    // Wait for form fields to be visible
    const identifierInput = page.getByLabel(/Email \/ Mobile \/ User ID/i);
    await identifierInput.waitFor({ state: 'visible', timeout: 10000 });
    await identifierInput.fill('admin@openanalytics.co.in');

    const passwordInput = page.getByLabel(/Password/i);
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill(ADMIN_CREDENTIALS.password);

    const signInButton = page.getByRole('button', { name: /Sign In/i });
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await signInButton.click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('[TC-AUTH-005] should require both fields', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForSelector('text=OPEN ANALYTICS', { timeout: 10000 });

    // Try to submit without filling fields
    const signInButton = page.getByRole('button', { name: /Sign In/i });
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await signInButton.click();

    // HTML5 validation should prevent submission
    const identifierInput = page.getByLabel(/Email \/ Mobile \/ User ID/i);
    await expect(identifierInput).toBeFocused({ timeout: 5000 });
  });

  test('[TC-AUTH-006] should open contact admin modal', async ({ page }) => {
    const requestAccessButton = page.getByRole('button', { name: /Contact admin/i });
    await requestAccessButton.waitFor({ state: 'visible', timeout: 10000 });
    await requestAccessButton.click();

    // Wait for modal to appear
    await page.waitForTimeout(300); // Small delay for modal animation
    await expect(page.getByText(/Request Login Access/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Close/i }).click();
    await expect(page.getByText(/Request Login Access/i)).not.toBeVisible();
  });
});
