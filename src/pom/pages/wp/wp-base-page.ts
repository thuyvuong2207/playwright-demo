import BasePage from "src/base/base-page";
import { type Page, type Locator, } from "playwright/test";
import BaseComponent from "src/base/base-component";
import WP_HEADER_UI from "src/pom/ui/wp/wp-header-ui";

class WpBasePage extends BasePage {
    public _url: string;
    private wpHeader: WpHeader;

    constructor(page: Page | BasePage, url: string) {
        super(page);
        this._url = url;
        this.wpHeader = new WpHeader(page);
    }

    public async selfNavigate(url?: string) {
        await this.goto(url || this._url);
    }

}
interface IWpHeader {
    logoText?: string;
}
class WpHeader extends BaseComponent {
    private logo: Locator;
    private txtSearch: Locator;
    private btnSearch: Locator;
    private btnCloseSearch: Locator;
    private btnCart: Locator;
    private btnMenu: Locator;
    // private dropdownList: DropdownList
    private btnLogin: Locator; 
    constructor(page: Page | BasePage) {
        super(page);
        this.txtSearch = this.locator(WP_HEADER_UI.txtSearch);
        this.btnSearch = this.locator(WP_HEADER_UI.btnSearch);
        this.btnCloseSearch = this.locator(WP_HEADER_UI.btnCloseSearch);
        this.btnCart = this.locator(WP_HEADER_UI.btnCart);
        this.btnMenu = this.locator(WP_HEADER_UI.btnMenu);
        // this.dropdownList = new DropdownList(WP_HEADER_UI.dropdownList, this.txtSearch);
        this.btnLogin = this.locator(WP_HEADER_UI.btnLogin);
        this.logo = this.locator(WP_HEADER_UI.logo);
    }
    async checkLogoText(expectedText: string): Promise<void> {
        const actualText = await this.logo.textContent();
        if (actualText !== expectedText) {
            throw new Error(`Expected logo text to be "${expectedText}", but got "${actualText}"`);
        }   
    }
    public async getTxtSearch(){
        const txtSearchPlaceholder = await this.txtSearch.getAttribute('placeholder');
        return txtSearchPlaceholder;
    }
}