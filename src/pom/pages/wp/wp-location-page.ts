import BasePage from "src/base/base-page";
import { type Page, type Locator } from "playwright/test";
import WP_LOCATION_UI from "src/pom/ui/wp/wp-location-page-ui";
import { step } from "src/fixtures/base-fixtures";
interface IWpLocationPage {
	locationNames: string[];
}
export default class WpLocationPage extends BasePage {
	private mdlTitle: Locator;
	public lblStore: Locator[] = [];
	private btnClose: Locator;

	constructor(page: Page | BasePage, options?: IWpLocationPage) {
		super(page);
		this.mdlTitle = this.locator(WP_LOCATION_UI.mdlTitle);
		this.btnClose = this.locator(WP_LOCATION_UI.btnClose);
		if (options && Array.isArray(options.locationNames)) {
			for (const locationName of options.locationNames) {
				this.lblStore.push(this.locator(WP_LOCATION_UI.lblStore(locationName)));
			}
		}
	}
	public getModalTitle() {
		return this.mdlTitle;
	}
	@step("Close Location Modal")
	async closeModal() {
		await this.click(this.btnClose);
	}
	@step("Check in Location Page")
	async checkIn(): Promise<void> {
		// await this.assertVisible(this.mdlTitle);
		for (const store of this.lblStore) {
			await this.assertVisible(store);
		}
	}
}
