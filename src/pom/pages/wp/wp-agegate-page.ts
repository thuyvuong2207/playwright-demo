import BasePage from "src/base/base-page";
import { type Page, type Locator } from "playwright/test";
import WP_AGEGATE_UI from "src/pom/ui/wp/wp-age-gate-ui";
import { step } from "src/fixtures/base-fixtures";
interface IWpAgegatePage {
	url: string;
}
export default class WpAgegatePage extends BasePage {
	private msgWarning: Locator;
	private titleWelcome: Locator;
	private logo: Locator;
	private btnRememberMe: Locator;
	private btnAccept: Locator;
	private btnDecline: Locator;
	private msgError: Locator;
	constructor(page: Page | BasePage, options: IWpAgegatePage) {
		super(page);
		this.msgWarning = this.locator(WP_AGEGATE_UI.msgWarning);
		this.titleWelcome = this.locator(WP_AGEGATE_UI.titleWelcome);
		this.logo = this.locator(WP_AGEGATE_UI.logo);
		this.btnRememberMe = this.locator(WP_AGEGATE_UI.btnRememberMe);
		this.btnAccept = this.locator(WP_AGEGATE_UI.btnAccept);
		this.btnDecline = this.locator(WP_AGEGATE_UI.btnDecline);
		this.msgError = this.locator(WP_AGEGATE_UI.msgError);
		this._url = options.url;
	}
	public async selfNavigate() {
		await this.goto(this._url);
	}
	public getTitleWelcome() {
        return this.titleWelcome;
    }
	public getmsgWarning() {
        return this.msgWarning;
    }
	public getLogo() {
		return this.logo;
	}
	public getBtnRememberMe() {
		return this.btnRememberMe;
	}
	public getBtnAccept() {
		return this.btnAccept;
	}
	public getBtnDecline() {
		return this.btnDecline;
	}
	public getMsgError() {
		return this.msgError;
	}

	@step("Check in Age Gate Page")
	async checkIn(): Promise<void> {
		await this.assertVisible(this.titleWelcome);
		await this.assertVisible(this.msgWarning);
		await this.assertVisible(this.btnAccept);
		await this.assertVisible(this.btnDecline);
		await this.assertVisible(this.logo);
	}
	@step("Accept on age gate")
	async acceptAgeGate() {
		await this.click(this.btnAccept);
	}
    @step("Decline on age gate")
    async declineAgeGate() {
        await this.click(this.btnDecline);
    }
    @step("Click on Remember Me")
    async clickRememberMe() {
        await this.click(this.btnRememberMe);
    }   
}
