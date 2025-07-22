import { Page } from '@playwright/test'

export class ProductsPage {

    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async addingProductToCartUnderShopAll(productName?: string) {
        // Taping the Shop All button
        await this.page.locator(".flex .header--nav-item [data-title='shop all']").click();

        // Selecting product under Shop All
        await this.page.getByRole('link', { name: 'Checkered Shirt $' }).nth(0).click();
        //await this.page.getByRole('heading', { name: productName }).filter({ hasNotText: 'New arrivals Explore' }).click();

    }
}