import type { Locator, Page } from "@playwright/test";
import Widget, { Checkbox, DropdownList, IWidget } from "src/base/base-widget";
import logger from "src/utils/logger";
import BaseComponent, { IWait } from "./base-component";
import BasePage from "./base-page";
export interface IPopup extends IWidget {
    btnApply?: string | Locator;
    btnCancel?: string | Locator;
    btnClose?: string | Locator;
    trigger?: string | Locator;
    root: string | Locator;
}
class Popup extends Widget {
    protected btnApply?: Locator | string;
    protected btnCancel?: Locator | string;
    protected btnClose?: Locator | string;
    protected root: Locator | string;
    constructor(page: Page | BaseComponent, options: IPopup) {
        super(page, options);
        this.root = options.root;
        this.btnApply = options?.btnApply;
        this.btnCancel = options?.btnCancel;
        this.btnClose = options?.btnClose;
        this.trigger = options?.trigger;
    }
    async open() {
        if (await this.isVisible(this.root)) {
            logger.debug("Popup is already opened.");
            return;
        }
        if (!this.trigger) {
            logger.error("Trigger is not set. Can not activate the popup.");
        }
        if (this.trigger) await this.click(this.trigger);
    }

    /**
     * Asserts that the popup appears.
     * @param options - Optional parameters for waiting.
     * @returns A Promise that resolves when the assertion is successful.
     */
    async assertAppear(options?: IWait): Promise<void> {
        logger.debug(
            "Asserting that the popup appears with root locator: ",
            this.root
        );
        await this.assertVisible(this.root, options || { timeout: 500 });
    }

    /**
     * Asserts that the popup element disappears from the page.
     *
     * @param options - The options for waiting. Popup normally takes a while to disappear, so the default timeout is 500ms.
     * @returns A Promise that resolves when the element disappears.
     */
    async assertDisappear(options?: IWait): Promise<void> {
        logger.debug("Asserting that the popup disappears.");
        this.assertNotVisible(this.root, options || { timeout: 500 });
    }
    async clickByText(text: string) {
        await this.click(
            this.locator(this.root).locator(`//*[contains(text(), '${text}')]`),
            { timeout: 5000 }
        );
    }
    async apply(): Promise<void> {
        logger.debug("Applying the popup.");
        if (this.btnApply === "") {
            throw new Error("Apply button is not set.");
        }
        if (this.btnApply === undefined) {
            throw new Error("Apply button is not set.");
        }
        await this.click(this.btnApply);
    }
    async cancel(): Promise<void> {
        logger.debug("Cancelling the popup.");
        if (this.btnCancel === "") {
            throw new Error("Cancel button is not set.");
        }
        if (this.btnCancel === undefined) {
            throw new Error("Cancel button is not set.");
        }
        await this.click(this.btnCancel);
    }
    async close(): Promise<void> {
        logger.debug("Closing the popup.");
        if (this.btnClose === "") {
            throw new Error("Close button is not set.");
        }
        if (this.btnClose === undefined) {
            throw new Error("Close button is not set.");
        }
        await this.click(this.btnClose);
    }
    async ok() {
        await this.locator(
            "//button//*[contains(text(), 'OK') or contains(text(), 'Ok')]|//button[text()='OK']|//button[text()='Ok']"
        ).click();
    }
}
export interface IViewSetting extends IPopup {
    columns?: string[];
    trigger?: string | Locator;
}
export type ItemsPerPage = 10 | 25 | 50 | 75 | 100;
interface ISetView {
    columns?: string[];
    itemsPerPage?: ItemsPerPage;
}
export class ViewSetting extends Popup {
    private columnCheckboxes: Checkbox;
    private columns: string[];
    private ddlItemsPerPage: DropdownList;
    // private;
    constructor(page: Page | BasePage, options: IViewSetting) {
        super(page, options);
        this.btnApply = this.locator(this.root).locator(
            "//button[text()='Apply']"
        );
        this.trigger = options.trigger;
        this.btnCancel = this.locator(this.root).locator(
            "//button[text()='Cancel']"
        );
        this.columns = options.columns || [];
        this.columnCheckboxes = new Checkbox(page, {
            rowsLocator: this.locator(this.root).locator(
                "//*[text()='Columns']/..//input[@type='checkbox']/../.."
            ),
        });
        this.ddlItemsPerPage = new DropdownList(page, {
            trigger: this.locator(this.root).locator(
                "//span[contains(text(),'items per page')]/following-sibling::div[1]"
            ),
            rowsLocator: this.locator("//ul//li"),
        });
    }
    async apply(): Promise<void> {
        if (!this.btnApply) {
            throw new Error("Apply button is not set.");
        }
        await this.click(this.btnApply, { double: true });
    }
    async assertAppear() {
        await super.assertAppear();
        await this.columnCheckboxes.assertAllChoicesAvailable(this.columns);
    }
    async selectColumns(columns: string[]) {
        await this.open();
        await this.columnCheckboxes.checkByText(columns);
        await this.apply();
    }
    async setItemsPerPage(items: ItemsPerPage) {
        await this.ddlItemsPerPage.selectByText(String(items));
    }
    async setColumns(columns: string[]) {
        await this.columnCheckboxes.checkByText(columns);
    }
    async setView(options: ISetView) {
        if (!options.columns && !options.itemsPerPage) {
            logger.error("No options are set.");
            throw new Error("No options are set.");
        }
        await this.open();
        if (options.columns) {
            await this.setColumns(options.columns);
        }
        if (options.itemsPerPage) {
            await this.setItemsPerPage(options.itemsPerPage);
            await this.sleep(1000)
        }
        await this.apply();
    }
}
interface IPopConfirm extends IWidget {
    root?: string | Locator;
}
export class PopConfirm extends Widget {
    private buttons: Locator;
    protected root?: Locator | string;
    constructor(page: Page | BasePage, options?: IPopConfirm) {
        super(page, options);
        this.buttons = this.locator("//button");
        this.root = options?.root;
    }
    async confirm(command: "OK" | "Cancel" | string) {
        const btnConfirm = this.root
            ? this.locator(this.root).locator(
                `//button//*[text()='${command}']|//button[text()='${command}']`
            )
            : this.locator(
                `//button//*[text()='${command}']|//button[text()='${command}']`
            );
        await this.assertVisible(btnConfirm);
        await this.click(btnConfirm);
    }

    async confirmDelete(command: "Yes" | "Cancel") {
        const btnConfirm = this.root
            ? this.locator(this.root).locator(
                `//button//*[text()='${command}']|//button[text()='${command}']`
            )
            : this.locator(
                `//button//*[text()='${command}']|//button[text()='${command}']`
            );
        await this.assertVisible(btnConfirm);
        await this.click(btnConfirm);
    }
    async assertMessage(message: string) {
        const messageLocator = this.root
            ? this.locator(this.root).locator(
                `//*[contains(normalize-space(),'${message}')]`
            )
            : this.locator(`//*[contains(normalize-space(),'${message}')]`);
        await this.waitForSelector(messageLocator, { min: 1 });
    }
}
export default Popup;
