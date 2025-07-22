import { test, expect } from '@playwright/test';
import { SignInPage } from '../page-objects/signInPage';
import { ProductsPage } from '../page-objects/productsPage';
import { MyCartPage } from '../page-objects/myCartPage';
import { CheckOutPage } from '../page-objects/myCheckOutPage';
import { MainPage } from '../page-objects/mainPage';
import { MyAccountPage } from '../page-objects/myAccountPage';
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

test('Validation where the user selected next day sa delivery method.', async ({ page }) => {

    // Populating the Sign In page
    const signInPage = new SignInPage(page);
    await signInPage.populateSignInPage(testData.existingUserAccountWithCorrectCredentials.username, testData.newUserAccountWithValidCredential.password);

    // Assertion: To ensure that the user was signed in successfully 
    await expect(page.getByText('Signed in successfully.')).toBeVisible();

    // Updating product under Shop All to the My Cart
    const productPage = new ProductsPage(page);
    await productPage.addingProductToCartUnderShopAll(testData.productDetails.productName);

    // Assertion: To ensure that selected product was added to My Cart
    await expect(page.getByRole('listitem').filter({ hasText: testData.productDetails.productName })).toBeVisible();

    // Updating order details in My Cart 
    const myCartPage = new MyCartPage(page);
    await myCartPage.updatingProductDetailsInMyCart(testData.productDetails.productSize, testData.productDetails.productColor,
        testData.productDetails.productQuantity);

    // Assertion: To ensure that the user selected the right color
    await expect(page.getByText(`Color: ${testData.productDetails.productColor}`)).toBeVisible();

    // Assertion: To esnure that the user selected the right size
    await expect(page.getByRole('button', { name: `SIZE: ${testData.productDetails.productSize}` })).toBeVisible();

    // Adding the product to My Cart
    await myCartPage.addingProductToMyCart();

    // Assertion: My Cart page
    // Assertion: To ensure that the user was successfully directed to cart page
    await page.waitForTimeout(5000)
    expect(await page.locator("#slideover-cart .items-center .text-xl").textContent()).toEqual('Cart');

    // Assertion: To ensure that the correct quantity was reflected on the cart icon
    const cartIconCounter = await page.locator('#slideover-cart .items-center .w-6 .cart-counter').textContent();
    expect(cartIconCounter).toEqual(testData.productDetails.productQuantity.toString());

    // Assertion: To ensure that the correct product was reflected on the cart
    const productNameInMyCart = await page.locator(".cart-line-item .ml-3 .justify-between .font-semibold").textContent()
    expect(productNameInMyCart).toEqual(testData.productDetails.productName);

    // Assertion: To ensure that the correct price was reflected on the cart
    const productPrice = await page.locator(".cart-line-item .ml-3 .mb-2").textContent();
    console.log(productPrice);

    // Assertion: To ensure that the correct product color was reflected on the cart
    const productColorInMyCart = await page.locator(".cart-line-item .ml-3 .flex-wrap .label-container .text-sm").textContent();
    expect(productColorInMyCart).toContain(testData.productDetails.productColor);

    // Assertion: To ensure that the correct product size was reflected on the cart
    const productSizeInMyCart = await page.locator(".cart-line-item .ml-3 .flex-wrap .px-2").filter({ hasNotText: 'T' }).textContent();
    expect(productSizeInMyCart).toContain(testData.productDetails.productSize);

    // Assertion: To ensure that the correct product quantity was reflected on the cart
    await expect(page.locator('#line_item_quantity')).toHaveValue(testData.productDetails.productQuantity.toString());

    // Assertion: To ensure that the correct total amount due was reflected on the cart
    const expectedTotalAmountDue = Number(productPrice?.replace(/[^\d.-]/g, '')) * Number(cartIconCounter?.replace(/[^\d.-]/g, ''));
    const actualAmountDueInString = await page.locator('.shopping-cart-total-text .shopping-cart-total-amount').textContent();
    expect(Number(actualAmountDueInString?.replace(/[^\d.-]/g, ''))).toEqual(expectedTotalAmountDue);

    // Proceed to checkout page
    const checkoutPage = new CheckOutPage(page);
    await checkoutPage.procedToCheckoutPage();

    // Assertion: To check if there is already existing delivery address
    await page.waitForTimeout(1500)
    const isDefaultAddressExisting = await page.getByText('This is your default delivery address').isVisible();
    await checkoutPage.populateShippingAddress(isDefaultAddressExisting, testData.shippingDetails.country, testData.shippingDetails.firstName,
        testData.shippingDetails.lastName, testData.shippingDetails.streetName, testData.shippingDetails.apartment, testData.shippingDetails.city,
        testData.shippingDetails.postalCode, testData.shippingDetails.phoneNumber);

    // Assertion: Address page
    // Assertion: To ensure that the correct product quantity was reflected
    const addressPageProductQuantity = await page.locator("#checkout_line_items .overflow-y-auto .justify-between .mr-5 .rounded-full").textContent();
    expect(Number(addressPageProductQuantity?.replace(/[^\d.-]/g, ''))).toEqual(testData.productDetails.productQuantity);
    // Assertion: To ensure that the correct product name was reflected
    await expect(page.getByRole('paragraph').filter({ hasText: testData.productDetails.productName })).toBeVisible();
    // Assertion: To ensure that the correct product color was reflected
    await expect(page.getByRole('paragraph').filter({ hasText: `Color: ${testData.productDetails.productColor}` })).toBeVisible();
    // Assertion: To ensure that the correct product size was reflected
    await expect(page.getByRole('paragraph').filter({ hasText: `Size: ${testData.productDetails.productSize}` })).toBeVisible();
    // Assertion: To ensure that the correct total amount was reflected
    const addressPageTotalAmount = await page.locator('.justify-between div #summary-order-total').textContent();
    expect(Number(addressPageTotalAmount?.replace(/[^\d.-]/g, ''))).toEqual(expectedTotalAmountDue);

    // Proceed to Delivery page
    await checkoutPage.proceedToDeliveryPage();

    // Selecting delivery method
    await checkoutPage.selectDeliveryMethod(testData.shippingDetails.deliveryMethod);

    // Assertion: Delivery page
    await expect(page.getByRole('paragraph').filter({ hasText: `${testData.shippingDetails.firstName} ${testData.shippingDetails.lastName}` })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.existingUserAccountWithCorrectCredentials.username })).toBeVisible();
    await expect(page.getByText(`${testData.shippingDetails.firstName} ${testData.shippingDetails.lastName}, ${testData.shippingDetails.streetName}, 
        ${testData.shippingDetails.apartment}, ${testData.shippingDetails.city}, ${testData.shippingDetails.postalCode}, ${testData.shippingDetails.country}`)).toBeVisible();
    const deliveryPageQuantity = await page.locator("#checkout_line_items .overflow-y-auto .justify-between .mr-5 .rounded-full").textContent();
    expect(Number(deliveryPageQuantity?.replace(/[^\d.-]/g, ''))).toEqual(testData.productDetails.productQuantity);
    await expect(page.getByRole('paragraph').filter({ hasText: testData.productDetails.productName })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: `Color: ${testData.productDetails.productColor}` })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: `Size: ${testData.productDetails.productSize}` })).toBeVisible();
    const shippingFee = await page.getByRole('listitem').filter({ hasText: testData.shippingDetails.deliveryMethod }).locator('.custom-control .text-right').textContent();
    const deliveryPageTotalAmount = await page.locator('.justify-between div #summary-order-total').textContent();
    const isShippingFeeFree = await page.getByText('Free').isVisible();
    if (isShippingFeeFree == true)
        expect(Number(deliveryPageTotalAmount?.replace(/[^\d.-]/g, ''))).toEqual(expectedTotalAmountDue);

    // Proceed to Delivery page
    await checkoutPage.proceedToPaymentsPage();

    // Assertion: To check if there is already existing payment
    await page.waitForTimeout(5000)
    const isDefaultPaymentExisting = await page.getByText('Add a new card').isVisible();
    await checkoutPage.populatePaymentPage(isDefaultPaymentExisting, testData.paymentDetails.cardNumber, testData.paymentDetails.cardExpirationDate, 
        testData.paymentDetails.cardCvc);

    // Assertion: Payment page
    await expect(page.getByRole('paragraph').filter({ hasText: `${testData.shippingDetails.firstName} ${testData.shippingDetails.lastName}` })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.existingUserAccountWithCorrectCredentials.username })).toBeVisible();
    await expect(page.getByText(`${testData.shippingDetails.firstName} ${testData.shippingDetails.lastName}, ${testData.shippingDetails.streetName}, 
        ${testData.shippingDetails.apartment}, ${testData.shippingDetails.city}, ${testData.shippingDetails.postalCode}, ${testData.shippingDetails.country}`)).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.deliveryMethod })).toBeVisible();
    const paymentPageDeliveryFee = await page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.deliveryMethod }).locator('strong').textContent();
    if (isShippingFeeFree == true)
        expect(Number(paymentPageDeliveryFee?.replace(/[^\d.-]/g, ''))).toEqual(0.00);
    else
        expect(Number(paymentPageDeliveryFee?.replace(/[^\d.-]/g, ''))).toEqual(Number(shippingFee?.replace(/[^\d.-]/g, '')));
    const paymentPageQuantity = await page.locator("#checkout_line_items .overflow-y-auto .justify-between .mr-5 .rounded-full").textContent();
    expect(Number(paymentPageQuantity?.replace(/[^\d.-]/g, ''))).toEqual(testData.productDetails.productQuantity);
    await expect(page.getByRole('paragraph').filter({ hasText: testData.productDetails.productName })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: `Color: ${testData.productDetails.productColor}` })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: `Size: ${testData.productDetails.productSize}` })).toBeVisible();
    const paymentPageTotalAmount = await page.locator('.justify-between div #summary-order-total').textContent();
    if (isShippingFeeFree == true)
        expect(Number(paymentPageTotalAmount?.replace(/[^\d.-]/g, ''))).toEqual(expectedTotalAmountDue);

    // Pay order
    await checkoutPage.payOrder();

    // Assertion: Order Summary Page
    await page.waitForTimeout(5000)
    await expect(page.getByRole('heading', { name: 'Your order is confirmed!' })).toBeVisible();
    await expect(page.getByText('Paid')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.existingUserAccountWithCorrectCredentials.username })).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: `${testData.shippingDetails.firstName} ${testData.shippingDetails.lastName}` }).first()).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.streetName }).first()).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.apartment }).first()).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.city }).first()).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.postalCode }).first()).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: testData.shippingDetails.country }).first()).toBeVisible();

    // Getting Order ID
    const orderId = await page.getByRole('paragraph').filter({ hasText: 'Order' }).locator('strong').textContent();

    // Proceed to Main page
    const mainPage = new MainPage(page);
    await mainPage.navigatingToMainPage();

    // Proceed to My Account page
    await mainPage.navigatingToMyAccountPage();

    // Retrieve order
    const myAccountPage = new MyAccountPage(page);
    await myAccountPage.retrieveOrder(orderId!);

    // Assertion: Order Details page
    await expect(page.getByRole('heading').filter({ hasText: orderId! })).toBeVisible();
    await expect(page.getByRole('link', { name: testData.productDetails.productName })).toBeVisible();
    await expect(page.getByText(testData.productDetails.productColor)).toBeVisible();
    await expect(page.getByText(`Quantity: ${testData.productDetails.productQuantity.toString()}`)).toBeVisible();
    const totalAmountDueWithShippingFee = expectedTotalAmountDue + Number(shippingFee?.replace(/[^\d.-]/g, ''))
    if (isShippingFeeFree == true)
        await expect(page.getByText(expectedTotalAmountDue.toString()).nth(1)).toBeVisible();
    else
        await expect(page.getByText(totalAmountDueWithShippingFee.toString())).toBeVisible();


    // Proceed to My Account page
    await mainPage.navigatingToMyAccountPage();

    // Logout account
    await myAccountPage.logout();

    // Assertion: To ensure that the user was signed in successfully 
    await expect(page.getByText('Signed out successfully.')).toBeVisible();
})
