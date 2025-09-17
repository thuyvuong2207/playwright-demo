import type { Locator, Page } from "@playwright/test";
import BasePage from "src/base/base-page";
import { step } from "src/fixtures/base-fixtures";
import SIGNUP_UI from "src/pom/ui/common/signup-ui";
export default class SignupPage extends BasePage {
    private txtEmail: Locator;
    private txtPassword: Locator;
    private txtFullName: Locator;
    private txtJobTitle: Locator;
    private txtCompanyName: Locator;
    private txtWebsiteUrl: Locator;
    private txtPhoneNumber: Locator;
    private btnCreateAccount: Locator;
    private lblVerifyEmail: Locator;
    private btnNext: Locator;
    private btnSkip: Locator;
    private btnLaunch: Locator;
    constructor(page: Page | BasePage) {
        super(page);
        this._url = `${this.BS_URL}/sign-up`;
        this.txtEmail = this.locator(SIGNUP_UI.txtEmail);
        this.txtPassword = this.locator(SIGNUP_UI.txtPassword);
        this.txtFullName = this.locator(SIGNUP_UI.txtFullName);
        this.txtJobTitle = this.locator(SIGNUP_UI.txtJobTitle);
        this.txtCompanyName = this.locator(SIGNUP_UI.txtCompanyName);
        this.txtWebsiteUrl = this.locator(SIGNUP_UI.txtWebsiteUrl);
        this.txtPhoneNumber = this.locator(SIGNUP_UI.txtPhoneNumber);
        this.btnCreateAccount = this.locator(SIGNUP_UI.btnCreateAccount);
        this.btnNext = this.locator(SIGNUP_UI.btnNext);
        this.btnSkip = this.locator(SIGNUP_UI.btnSkip);
        this.btnLaunch = this.locator(SIGNUP_UI.btnLaunch);
        this.lblVerifyEmail = this.locator(SIGNUP_UI.lblVerifyEmail);
    }
    @step("Sign up")
    async quickSignUp(params: {
        email: string;
        password: string;
        fullName: string;
        companyName: string;
        websiteUrl: string;
        phoneNumber: string;
        jobTitle?: string;
    }) {
        await this.fill(this.txtEmail, params.email);
        await this.fill(this.txtPassword, params.password);
        await this.click(this.btnCreateAccount);
        await this.assertVisible(this.lblVerifyEmail, { timeout: 10000 });
        await this.fill(this.txtFullName, params.fullName);
        if (params.jobTitle) {
            await this.fill(this.txtJobTitle, params.jobTitle);
        }
        await this.fill(this.txtCompanyName, params.companyName);
        await this.fill(this.txtWebsiteUrl, params.websiteUrl);
        await this.fill(this.txtPhoneNumber, params.phoneNumber);
        await this.click(this.btnNext);
        await this.waitForSelector(this.btnSkip);
        await this.sleep(1000);
        await this.click(this.btnSkip);
        await this.sleep(2000);
        await this.click(this.btnLaunch);
    }
}
