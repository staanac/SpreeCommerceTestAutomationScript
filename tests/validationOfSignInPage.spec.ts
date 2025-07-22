import { test, expect } from '@playwright/test';
import { SignInPage } from '../page-objects/signInPage';
import { testData } from '../utl/testData'; 

test.beforeEach(async ({ page }) => {
    // Launching the Spree Commerce page
    await page.goto('https://demo.spreecommerce.org/');

    // Assertion: To ensure that the user was directed successfully to Spree Commerce landing page
    await expect(page.getByText('Welcome to this Spree Commerce demo website')).toBeVisible();

    // Tapping the My Account button
    await page.waitForTimeout(1000);
    await page.locator(".hidden [data-action='click->slideover-account#toggle click@window->slideover-account#hide click->toggle-menu#hide touch->toggle-menu#hide']").click();

    // Assertion: To ensure that the user was directed login page
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
})

test('Validation where the user entered incorrect password', async ({ page }) => {
    // Populating the Sign In page
    const signInPage = new SignInPage(page)
    await signInPage.populateSignInPage(testData.existingUserAccountWithIncorrectPassword.username, testData.existingUserAccountWithIncorrectPassword.password)

    // Assertion: To ensure that the user was NOT successfully logged in
    await expect(page.getByText('Invalid email or password.')).toBeVisible()
})

test('Validation where the user entered non-existing user', async ({ page }) => {
    // Populating the Sign In page
    const signInPage = new SignInPage(page);
    await signInPage.populateSignInPage(testData.nonExistingUserAccount.username, testData.nonExistingUserAccount.password);

    // Assertion: To ensure that the user was NOT successfully logged in
    await expect(page.getByText('Invalid email or password.')).toBeVisible()
})

test('Validation where the user entered existing user', async ({ page }) => {
    // Populating the Sign In page
    const signInPage = new SignInPage(page);
    await signInPage.populateSignInPage(testData.existingUserAccountWithCorrectCredentials.username, testData.existingUserAccountWithCorrectCredentials.password);

    // Assertion: To ensure that the user was signed in successfully 
    await expect(page.getByText('Signed in successfully.')).toBeVisible();
})