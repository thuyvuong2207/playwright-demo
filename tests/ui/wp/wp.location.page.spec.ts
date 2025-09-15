// import { test } from "src/fixtures/base-fixtures";
import { test } from "src/fixtures/wp/wp-base-fixture";
import { assertStringContains } from "src/utils/assertions";

test.describe("WP - Mood Cannabis - Location Page Tests", () => {
	test("Go to Location Page", async ({ locationPageSiteMood }) => {
		await locationPageSiteMood.checkIn();
		const modalTitle = await locationPageSiteMood.getModalTitle().textContent();
		assertStringContains(modalTitle ?? "","Choose your store");
		assertStringContains(await locationPageSiteMood.getTextContent(locationPageSiteMood.lblStore[0]) ?? "","3923 Victoria Ave");
		assertStringContains(await locationPageSiteMood.getTextContent(locationPageSiteMood.lblStore[1]) ?? "","6404 Metral Dr");
		await locationPageSiteMood.screenshotAndAttach("Location Page Loaded", { timeout: 3000, });
	});
});
