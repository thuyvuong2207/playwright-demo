import type { Locator, Page } from "@playwright/test";
import BasePage from "src/base/base-page";
import { step } from "src/fixtures/base-fixtures";
import LOGIN_UI from "src/pom/ui/common/login-ui";
import { IRoleProfile } from "src/types/profile";
export default class LoginPage extends BasePage {
    private txtEmail: Locator;
    private txtPassword: Locator;
    private btnLogin: Locator;
    private btnForgotPassword: Locator;
    private msgIncorrectEmailOrPassword: Locator;
    private msgEmailMustNotBeEmpty: Locator;
    private msgPasswordMustNotBeEmpty: Locator;
    constructor(page: Page | BasePage, options?: IRoleProfile) {
        super(page, options);
        this.txtEmail = this.locator(LOGIN_UI.txtEmail);
        this.txtPassword = this.locator(LOGIN_UI.txtPassword);
        this.btnLogin = this.locator(LOGIN_UI.btnLogin);
        this.btnForgotPassword = this.locator(LOGIN_UI.btnForgotPassword);
        this.msgIncorrectEmailOrPassword = this.locator(
            LOGIN_UI.msgIncorrectEmailOrPassword
        );
        this.msgEmailMustNotBeEmpty = this.locator(
            LOGIN_UI.msgEmailMustNotBeEmpty
        );
        this.msgPasswordMustNotBeEmpty = this.locator(
            LOGIN_UI.msgPasswordMustNotBeEmpty
        );
        this._url = `${this.BS_URL}/login`;
    }
    @step("Login")
    async login(email: string, password: string) {
        await this.fill(this.txtEmail, email);
        await this.fill(this.txtPassword, password);
        await this.click(this.btnLogin);
    }
    @step("Forgot password")
    async forgotPassword() {
        await this.click(this.btnForgotPassword);
    }
    @step("Check in login page")
    async checkIn() {
        await this.assertVisible(this.txtEmail);
        await this.assertVisible(this.txtPassword);
        await this.assertVisible(this.btnLogin);
    }
    @step("Assert incorrect email or password message visible")
    async assertIncorrectEmailOrPasswordMessage() {
        await this.assertVisible(this.msgIncorrectEmailOrPassword);
    }
    @step("Assert email must not be empty message visible")
    async assertEmailMustNotBeEmptyMessage() {
        await this.assertVisible(this.msgEmailMustNotBeEmpty);
    }
    @step("Assert password must not be empty message visible")
    async assertPasswordMustNotBeEmptyMessage() {
        await this.assertVisible(this.msgPasswordMustNotBeEmpty);
    }
}
export class SingletonLoginPage {
    private static instance: LoginPage;
    private constructor() { }
    static async getInstance(page: Page, options?: IRoleProfile) {
        if (!SingletonLoginPage.instance) {
            SingletonLoginPage.instance = new LoginPage(page, options);
        }
        return await SingletonLoginPage.instance.newPage();
    }
}
