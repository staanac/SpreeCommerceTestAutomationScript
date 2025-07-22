import { expect, test } from '@playwright/test';
import { SignUpPage } from '../page-objects/signUpPage';
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

    // Tapping the 'Sign Up' link
    await page.waitForTimeout(1000);
    await page.getByRole('link', { name: 'Sign Up' }).click();

    // Assertion: To ensure that the user was directed Sign Up page
    await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();
})

test('Validation where email address was already taken or existing in the record.', async ({ page }) => {
    // Populating the Sign Up page
    const signUpPage = new SignUpPage(page);
    await signUpPage.populateSignUpPage(testData.existingUserAccountWithCorrectCredentials.username, testData.existingUserAccountWithCorrectCredentials.password,
        testData.existingUserAccountWithCorrectCredentials.password);

    // Assertion: To ensure that the user was not created
    await expect(page.getByText('Email has already been taken')).toBeVisible();
})

test('Validation where password is less than 6 characters', async ({ page }) => {
    // Populating the Sign Up page
    const signUpPage = new SignUpPage(page);
    await signUpPage.populateSignUpPage(testData.newUserAccountWithInvalidPassword.username, testData.newUserAccountWithInvalidPassword.password,
        testData.newUserAccountWithInvalidPassword.password);

    // Assertion: To ensure that the user was not created
    await expect(page.getByText('Password is too short (minimum is 6 characters)')).toBeVisible();
})

test('Validation where password mismatched with password confirmation', async ({ page }) => {
    // Populating the Sign Up page
    const signUpPage = new SignUpPage(page);
    await signUpPage.populateSignUpPage(testData.newUserAccountWherePasswordMismatched.username, testData.newUserAccountWherePasswordMismatched.password,
        testData.newUserAccountWherePasswordMismatched.passwordConfirmation);

    // Assertion: To ensure that the user was not created
    await expect(page.getByText("Password Confirmation doesn't match Password")).toBeVisible();
})

test('Validation where all the required fields were populated correctly', async ({ page }) => {
    // Populating the Sign Up page
    const signUpPage = new SignUpPage(page);
    await signUpPage.populateSignUpPage(testData.newUserAccountWithValidCredential.username, testData.newUserAccountWithValidCredential.password,
        testData.newUserAccountWithValidCredential.password);

    // Assertion: To ensure that the user was successfully created
    await expect(page.getByText('Welcome! You have signed up successfully.')).toBeVisible();
})