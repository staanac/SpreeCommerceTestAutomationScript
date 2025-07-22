import { Page } from '@playwright/test'

export class MainPage {

    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async navigatingToMainPage() {
        await this.page.waitForTimeout(1000)
        await this.page.getByRole('img', { name: 'Spree Commerce DEMO' }).click();
    }

    async navigatingToMyAccountPage() {
        await this.page.waitForTimeout(1000)
        await this.page.locator(".hidden [href='/account']").click();
    }
}