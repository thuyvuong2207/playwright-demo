import { Locator, Page } from "@playwright/test";
import BasePage from "src/base/base-page";
import { getLastResetPasswordLink } from "src/utils/emails/guerrilla-mail";
export class ResetPasswordPage extends BasePage {
    private txtEmail: Locator;
    private btnSendEmail: Locator;
    private txtPassword: Locator;
    private txtConfirmPassword: Locator;
    private btnResetPassword: Locator;
    private msgSuccessfullySendEmail: Locator;
    constructor(page: Page) {
        super(page);
        this._url = "";
        this.txtEmail = this.locator("//input[@name='email']");
        this.btnSendEmail = this.locator("//button[@type='submit']");
        this.txtPassword = this.locator("#setPwd__pwd");
        this.txtConfirmPassword = this.locator("#setPwd__confirmPwd");
        this.btnResetPassword = this.locator("//button[@type='submit']");
        this.msgSuccessfullySendEmail = this.locator(
            "//p[text()='Please check your email and follow the instruction.']"
        );
    }
    async checkInSendMailResetPassword(): Promise<void> {
        await this.assertVisible(this.txtEmail);
        await this.assertVisible(this.btnSendEmail);
    }

    async checkInResetPassword(): Promise<void> {
        await this.assertVisible(this.txtPassword);
        await this.assertVisible(this.txtConfirmPassword);
        await this.assertVisible(this.btnResetPassword);
    }
    async sendMailResetPassword(email: string) {
        this.fill(this.txtEmail, email);
        await this.click(this.btnSendEmail);
        await this.assertVisible(this.msgSuccessfullySendEmail, {
            timeout: 10000,
        });
    }
    async setNewPassword(password: string) {
        await this.sleep(500);
        await this.fill(this.txtPassword, password);
        await this.sleep(500);
        await this.fill(this.txtConfirmPassword, password);
        await this.sleep(500);
        await this.click(this.btnResetPassword);
    }
    async getResetPasswordLink(email: string) {
        return await getLastResetPasswordLink(email);
    }
    async resetPassword(email: string, password: string) {
        await this.sendMailResetPassword(email);
        const resetLink = await this.getResetPasswordLink(email);
        await this.goto(resetLink);
        await this.setNewPassword(password);
        await this.sleep(5000);
    }
}
export default ResetPasswordPage;
