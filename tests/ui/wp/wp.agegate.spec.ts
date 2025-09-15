import { test } from "src/fixtures/wp/wp-base-fixture";
import LocationPage from "src/pom/pages/wp/wp-location-page";
import { assertStringContains } from "src/utils/assertions";

test.describe("WP - Mood Cannabis - Age Gate Page Tests", () => {
	test("Go to Age Gate Page", async ({ ageGatePage }) => {
		await ageGatePage.checkIn();
		const warningText = await ageGatePage.getmsgWarning().textContent();
		const titleText = (await ageGatePage.getTitleWelcome().textContent())?.toLowerCase();
		assertStringContains(
			warningText ?? "",
			"Please verify that you are 19 years of age or older to enter this site.",
		);
		assertStringContains(titleText ?? "", "");
	});
	test("Accept Age Gate", async ({ ageGatePage }) => {
		await ageGatePage.acceptAgeGate();
		const locationPage = new LocationPage(ageGatePage);
		await locationPage.checkIn();
		await locationPage.screenshotAndAttach(
			"Accepted age gate & Load location page",
			{ timeout: 3000 },
		);
	});
	test("Decline Age Gate", async ({ ageGatePage }) => {
		await ageGatePage.declineAgeGate();
		const errorText = await ageGatePage.getMsgError().textContent();
		assertStringContains(
			errorText ?? "",
			"We only sell to adults age 19 years or older.",
		);
		await ageGatePage.screenshotAndAttach("Declined age gate", {
			timeout: 3000,
		});
	});
	test("Click Remember Me", async ({ ageGatePage }) => {
		await ageGatePage.clickRememberMe();

	});
});
