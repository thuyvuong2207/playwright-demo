import { test as base } from "src/fixtures/base-fixtures";
import WpAgegatePage from "src/pom/pages/wp/wp-agegate-page";
import WpLocationPage from "src/pom/pages/wp/wp-location-page";
export const test = base.extend<
	{
		locationPageSiteMood: WpLocationPage;
		ageGatePage: WpAgegatePage;
	},
	{ forEachWorker: void }
>({
	locationPageSiteMood: async ({ basePage }, use) => {
		const ageGatePage = new WpAgegatePage(basePage.getPage(),{url: ""});
		await ageGatePage.selfNavigate();
		await ageGatePage.acceptAgeGate();
		const locationPage = new WpLocationPage(basePage.getPage(), {locationNames: ["3923 Victoria Ave", "6404 Metral Dr"]});
		await use(locationPage);
	},
	ageGatePage: async ({ basePage }, use) => {
		const ageGatePage = new WpAgegatePage(basePage.getPage(), {url: ""});
		await ageGatePage.selfNavigate();
        await use(ageGatePage);
	},
	// forEachWorker: [async ({}, use) => {}, { scope: "worker", auto: true }],
});
