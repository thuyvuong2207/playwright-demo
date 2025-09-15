export const WP_LOCATION_UI = {
	mdlTitle: "//h2[@class='modal-title uppercase']",
	lblStore: (storeName: string) => `//label[@class='form-check-label' and @for='${storeName}']`,
	btnClose: "//button[@id='btn-close-select-location-popup']",
};
export default WP_LOCATION_UI;
