import { Page } from '@playwright/test'

export class MyCartPage {

    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async updatingProductDetailsInMyCart(productSize: string, productColor?: string, productQuantity?: number) {
        // Selecting the product color
        await this.page.waitForTimeout(2000)

        //Updating the product color
        if (productColor != undefined)
            await this.page.getByRole('listitem').filter({ has: this.page.locator(`[value="${productColor.toLowerCase()}"]`) }).dblclick();

        //Updating the product size
        await this.page.locator('#product-variant-picker').getByRole('button', { name: 'PLEASE CHOOSE SIZE' }).click();
        await this.page.locator('#product-variant-picker label').filter({ hasText: productSize }).click();

        // Updating the product quantity
        if (productQuantity != undefined) {
            for (let i = 1; i < productQuantity; ++i) {
                await this.page.locator('.increase-quantity').click();
            }
        }
    }

    async addingProductToMyCart() {
        // Adding the product to My Cart
        await this.page.getByRole('button', { name: "ADD TO CART" }).click();
    }
}