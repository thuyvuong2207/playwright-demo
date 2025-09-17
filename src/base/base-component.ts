import path from "node:path";
import type {
    Browser,
    BrowserContext,
    FrameLocator,
    Locator,
    Page,
} from "@playwright/test";
import { expect } from "@playwright/test";
import { config } from "dotenv";
import { IRoleProfile, Profile, Role } from "src/types/profile";
import logger from "src/utils/logger";
import { ocr } from "src/utils/ocr";
import { randomCode } from "src/utils/random";
import { ISort, checkSorted } from "src/utils/sort";
import { initPage } from "./raw-page";
config();

/**
 * Represents a locator used to identify an element in the UI.
 */
interface ILocator {
    /**
     * An optional array of frames locators to navigate to the element.
     */
    framesChain?: Array<string>;
    children?: string[];
}
interface IGetPage {
    offset?: number;
    index?: number;
    title?: string;
}
/**
 * Represents the options for waiting in UI automation.
 */
export interface IWait {
    /**
     * The locator used to identify the element to wait for.
     */
    locator?: string | Locator;

    /**
     * The maximum amount of time to wait, in milliseconds.
     */
    timeout?: number;

    /**
     * The amount of time to sleep before performing the freeze/sleep, in milliseconds.
     */
    sleep?: number;
    interval?: number;

    /**
     * The state to wait for before continuing the automation.
     * Possible values are "domcontentloaded", "load", or "networkidle".
     */
    state?: "domcontentloaded" | "load" | "networkidle";
}

export interface IWaitForSelector {
    count?: number;
    min?: number;
    max?: number;
    timeout?: number;
    interval?: number;
    property?: {
        key: string;
        value?: string;
        containedValue?: string;
    };
    text?: string;
    containedText?: string;
    state?: "visible" | "hidden" | "enabled" | "disabled";
    message?: string;
    excludedTexts?: string[];
}

/**
 * Represents a dialog that can be displayed in the UI.
 */
export interface IDialog {
    /**
     * The type of the dialog.
     * Possible values are "prompt", "alert", or "confirm".
     */
    type: "prompt" | "alert" | "confirm";

    /**
     * Indicates whether the dialog requires confirmation.
     * This property is only applicable for "confirm" type dialogs.
     */
    confirm?: boolean;

    /**
     * The text content of the dialog.
     * This property is only applicable for "prompt" type dialogs.
     */
    text?: string;
}

/**
 * Represents the options for a click action.
 * Extends the `IWait` interface.
 */
interface IClick extends IWait {
    /**
     * Specifies whether to force the click action even if the element is covered by other elements.
     */
    force?: boolean;
    blank?: boolean;
    timeout?: number;
    double?: boolean;
}

/**
 * Represents the options for clicking around an element.
 */
type IClickAroundElement = {
    /**
     * The border to click around the element.
     */
    border?: "top" | "bottom" | "left" | "right";

    /**
     * The offset (distance) to click around the element.
     */
    offset?: number;
};

/**
 * Represents a list with different selection types.
 */
interface IList {
    type: "oneof" | "all" | "none";
}

/**
 * Represents the options for filling a component.
 */
interface IFill extends IWait {
    /**
     * Specifies whether to clear the component before filling it.
     */
    clear?: boolean;
    confirm?: boolean;
    force?: boolean;
}

/**
 * Represents the options for waiting for the count of a selector.
 */
interface IWaitForSelectorCount {
    /**
     * The expected count of the selector.
     * It can be a single number or an array of numbers to wait for any of the specified counts.
     */
    count?: number | number[];

    /**
     * The interval (in milliseconds) at which to check the count of the selector.
     * Defaults to 1000.
     */
    interval?: number;

    /**
     * The maximum time (in milliseconds) to wait for the count of the selector.
     * Defaults to 10000.
     */
    timeout?: number;

    /**
     * The minimum count of the selector to consider the wait successful.
     * If specified, the wait will only succeed if the count is greater than or equal to this value.
     */
    minimum?: number;

    /**
     * The maximum count of the selector to consider the wait successful.
     * If specified, the wait will only succeed if the count is less than or equal to this value.
     */
    maximum?: number;
}

export default class BaseComponent {
    protected _page: Page;
    protected role: Role = Role.NOROLE;
    protected profile: Profile = Profile.NOPROFILE;
    private context: BrowserContext;
    async checkIn(): Promise<void> { }
    /**
     * Creates an instance of BasePage.
     * @param {Page} page - The Playwright page object.
     */
    constructor(page: Page | BaseComponent, options?: IRoleProfile) {
        this._page = page instanceof BaseComponent ? page.getPage() : page;
        // this.inherit(page, options);
        this.context = this._page.context();
        if (options?.role && options.profile) {
            this.setRoleProfile(options);
        } else if (page instanceof BaseComponent) {
            this.role = page.getRole();
            this.profile = page.getProfile();
        }
    }
    setProfile(profile: Profile) {
        this.profile = profile;
    }

    setRole(role: Role) {
        this.role = role;
    }

    setRoleProfile(params: IRoleProfile) {
        if (params.role) {
            this.role = params.role;
        }
        if (params.profile) {
            this.profile = params.profile;
        }
    }
    getRole(): Role {
        return this.role;
    }
    getProfile(): Profile {
        return this.profile;
    }
    getRoleProfile(): IRoleProfile {
        return { role: this.role, profile: this.profile };
    }
    /**
     * Retrieves the page associated with the base component.
     * @param options - Optional parameters for retrieving the page.
     * @returns The page associated with the base component.
     */
    getPage(options?: IGetPage): Page {
        if (options?.index) {
            return this.context.pages()[options.index];
        }
        if (options?.offset) {
            const currentIndex = this.context.pages().indexOf(this._page);
            return this.context.pages()[currentIndex + options.offset];
        }
        if (options?.title) {
            const newPage = this.context.pages().find(async (page) => {
                (await page.title()) === options.title;
            });
            if (!newPage) {
                throw new Error(`Page with title: ${options.title} not found`);
            }
            return newPage;
        }
        return this._page;
    }
    getContext(): BrowserContext {
        return this.context;
    }
    getBrowser(): Browser {
        const browser = this.context.browser();
        if (!browser) {
            throw new Error("Browser is not initialized");
        }
        return browser;
    }

    async newPage(): Promise<Page> {
        return await initPage({ fromContext: this.context });
    }
    async newContextPage(): Promise<Page> {
        return await initPage({ fromBrowser: this.getBrowser() });
    }

    async setSize(width: number, height: number) {
        await this._page.setViewportSize({ width, height });
    }

    /**
     * Retrieves the size of the viewport for the current page.
     * @returns A Promise that resolves to the size of the viewport.
     */
    async getPageSize() {
        const size = await this.getPage().viewportSize();
        return size;
    }

    // Interaction methods

    /**
     * Clicks on an element with the specified selector.
     * @param {string} selector - The selector of the element to click.
     */
    async click(selector: string | Locator, options?: IClick) {
        try {
            logger.debug(`Clicking element by selector: ${selector}`);
            if (options?.blank) {
                const [newPage] = await Promise.all([
                    this.context.waitForEvent("page"),
                    this.locator(selector).click({
                        force: options?.force,
                        timeout: options?.timeout || 15000,
                    }),
                ]);
                return newPage;
            }
            if (options?.double) {
                await this.locator(selector).dblclick({
                    force: options?.force,
                    timeout: options?.timeout || 15000,
                });
                return;
            }
            await this.locator(selector).click({
                force: options?.force,
                timeout: options?.timeout || 15000,
            });
        } catch (err) {
            throw new Error(
                `Failed clicking element by selector: ${selector}, \n- Error: ${err}`
            );
        }
    }

    async clickAnyVisible(selector: Locator | string, options?: IClick) {
        const elements = await this.locator(selector).all();
        for (const element of elements) {
            if (await element.isVisible()) {
                await element.click(options);
                return;
            }
        }
        throw new Error(`No visible element found for selector: ${selector}`);
    }

    /**
     * Clicks around the specified element based on the provided options.
     * @param selector - The selector or Locator of the element to click around.
     * @param options - The options for clicking around the element.
     */
    async clickAroundElement(
        selector: string | Locator,
        options?: IClickAroundElement
    ) {
        logger.debug(`Clicking around element by selector: ${selector}`);
        const border = options?.border || "top";
        const offset = options?.offset || 10;
        const position = await this.getPosition(selector);
        if (!position) {
            throw new Error("Element position is not found");
        }
        if (border === "top") {
            await this._page?.mouse.click(position.x, position.y - offset);
        }
        if (border === "bottom") {
            await this._page?.mouse.click(position.x, position.y + offset);
        }
        if (border === "left") {
            await this._page?.mouse.click(position.x - offset, position.y);
        }
        if (border === "right") {
            await this._page?.mouse.click(position.x + offset, position.y);
        }
    }

    /**
     * Sets the focus on the element specified by the given selector.
     * @param selector - The selector or locator of the element to focus.
     */
    async focus(selector: string | Locator) {
        logger.debug(`Focusing element by selector: ${selector}`);
        await this.locator(selector).focus();
    }

    /**
     * Fills an input element with the specified text.
     * @param {string} selector - The selector of the input element.
     * @param {string} text - The text to fill in the input element.
     */
    async fill(
        selector: string | Locator,
        text: string | number,
        options?: IFill
    ) {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        try {
            logger.debug(
                `Filling element by selector: ${selector} with text: ${text}`
            );
            // await this.click(selector);
            if (options?.clear) {
                await this.locator(selector).clear();
            }
            const _text = typeof text === "number" ? text.toString() : text;
            await this.locator(selector).fill(_text, { force: options?.force });
            if (options?.confirm) {
                await this.keyboard("Enter");
            }
        } catch (err) {
            throw new Error(
                `Failed filling element by selector: ${selector}, error: ${err}`
            );
        }
    }

    /**
     * Simulates keyboard actions such as pressing a key, releasing a key, or holding a key down.
     *
     * @param key - The key to be pressed or released.
     * @param action - The action to perform on the key. Can be "down" to hold the key down, "up" to release the key, or undefined to press the key.
     */
    async keyboard(key: string, action?: "down" | "up") {
        try {
            if (action === "down") {
                logger.debug(`Pressing key: ${key} down`);
                await this._page?.keyboard.down(key);
            } else if (action === "up") {
                logger.debug(`Release key: ${key} up`);
                await this._page?.keyboard.up(key);
            } else {
                logger.debug(`Pressing key: ${key}`);
                await this._page?.keyboard.press(key);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Clicks an element identified by the given selector and handles any dialog that appears on the page.
     * @param selector - The selector or Locator of the element to click.
     * @param options - Optional configuration for handling the dialog.
     */
    async clickAndHandleDialog(selector: string | Locator, options?: IDialog) {
        try {
            logger.info(`Clicking element by selector: ${selector}`);
            if (options?.type === "confirm") {
                if (options?.confirm) {
                    await this.waitForPageDialogToBeAccepted();
                } else {
                    await this.waitForPageDialogToBeDismissed();
                }
            } else if (options?.type === "alert") {
                await this.waitForPageDialogToBeAccepted();
            } else if (options?.type === "prompt") {
                if (options?.text) {
                    await this.waitForPageDialogToBeFilled(options?.text);
                }
            }
            await this.click(selector);
        } catch (err) {
            logger.error(err);
        }
    }

    // Listener

    /**
     * Waits for a page dialog to be accepted.
     * @remarks
     * This method listens for the "dialog" event on the page and accepts the dialog when it occurs.
     * @returns A promise that resolves when the dialog is accepted.
     */
    async waitForPageDialogToBeAccepted() {
        this.getPage().on("dialog", async (dialog) => {
            logger.info(`Accepting dialog: ${dialog.message()}`);
            await dialog.accept();
        });
    }

    /**
     * Waits for the page dialog to be dismissed.
     *
     * @remarks
     * This method listens for the "dialog" event on the page and dismisses the dialog when it occurs.
     *
     * @returns A promise that resolves when the page dialog is dismissed.
     */
    async waitForPageDialogToBeDismissed() {
        this.getPage().on("dialog", async (dialog) => {
            logger.info(`Dismissing dialog: ${dialog.message()}`);
            await dialog.dismiss();
        });
    }

    /**
     * Waits for a page dialog to be filled with the specified text.
     *
     * @param text - The text to fill the dialog with.
     */
    async waitForPageDialogToBeFilled(text: string) {
        this.getPage().on("dialog", async (dialog) => {
            logger.info(
                `Filling dialog: ${dialog.message()} with text: ${text}`
            );
            await dialog.accept(text);
        });
    }

    /**
     * Gets the type of the dialog.
     * @returns {Promise<void>} A promise that resolves when the dialog type is retrieved.
     */
    async getDialogType() {
        this.getPage().on("dialog", async (dialog) => {
            logger.info(`Dialog type: ${dialog.type()}`);
        });
    }

    // Read attribute methods

    /**
     * Retrieves the inner text of an element identified by the given selector.
     *
     * @param selector - The selector used to identify the element.
     * @returns A promise that resolves to the inner text of the element.
     */
    async getInnerText(selector: string | Locator, options?: IWait) {
        return await this.locator(selector).innerText({
            timeout: options?.timeout || 10000,
        });
    }

    /**
     * Retrieves the text content of an element identified by the given selector.
     * @param selector - The selector used to identify the element.
     * @returns A promise that resolves to the text content of the element.
     */
    async getTextContent(selector: string | Locator, options?: IWait) {
        return await this.locator(selector).textContent({
            timeout: options?.timeout || 10000,
        });
    }

    async getInputValue(
        selector: string | Locator,
        options?: IWait
    ): Promise<string> {
        logger.debug(`Getting input value for selector: ${selector}`);
        return await this.locator(selector).inputValue({
            timeout: options?.timeout || 10000,
        });
    }

    /**
     * Retrieves the OCR text of an element identified by the given selector.
     *
     * @param selector - The selector or locator of the element.
     * @returns A promise that resolves to the OCR text of the element.
     */
    async getOcrText(selector: string | Locator) {
        const buffer: Buffer = await this.locator(selector).screenshot();
        return await ocr(buffer);
    }

    /**
     * Retrieves the value of the specified attribute for the given selector.
     *
     * @param selector - The selector or locator to identify the element.
     * @param attribute - The name of the attribute to retrieve.
     * @returns A promise that resolves to the value of the attribute.
     */
    async getAttribute(
        selector: string | Locator,
        attribute: string,
        options?: IWait
    ) {
        if (attribute === "innerText") {
            return await this.locator(selector).innerText({
                timeout: options?.timeout || 10000,
            });
        }
        if (attribute === "textContent") {
            return await this.locator(selector).textContent({
                timeout: options?.timeout || 10000,
            });
        }
        return await this.locator(selector).getAttribute(attribute, {
            timeout: options?.timeout || 10000,
        });
    }

    /**
     * Retrieves the value of the specified property for the given selector.
     *
     * @param selector - The selector or locator to identify the element.
     * @param property - The name of the property to retrieve.
     * @returns A promise that resolves to the value of the property.
     */
    async getPosition(selector: string | Locator) {
        const position = await this.locator(selector).boundingBox();
        if (!position) {
            return undefined;
        }
        return {
            top: position?.y,
            bottom: position?.y + position?.height,
            left: position?.x,
            right: position?.x + position?.width,
            x: position?.x,
            y: position?.y,
            width: position?.width,
            height: position?.height,
        };
    }
    async getCenterPosition(selector: string | Locator) {
        const position = await this.getPosition(selector);
        if (!position) {
            return undefined;
        }
        return {
            x: position.x + position.width / 2,
            y: position.y + position.height / 2,
        };
    }

    // Dropdown list option

    /**
     * Selects an option from a dropdown list using a specific selector.
     *
     * @param {string | Locator} selector - The selector of the dropdown list or a Locator object.
     * @param {string} option - The text of the option to be selected.
     * @return {Promise<void>} - A Promise that resolves when the option is selected.
     * @throws {Error} - If an error occurs while selecting the option.
     * @deprecated - Use DropdownList instead.
     */
    async selectOptionByText(selector: string | Locator, option: string) {
        try {
            logger.debug(`Selecting option: ${option} from dropdown list`);
            if (typeof selector === "string") {
                await this._page.selectOption(selector, option);
            } else {
                await selector.selectOption(option);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Selects an option from a dropdown list by its index.
     *
     * @param {string | Locator} selector - The selector of the dropdown list or a Locator object.
     * @param {number} index - The index of the option to be selected.
     * @return {Promise<void>} - A Promise that resolves when the option is selected.
     * @throws {Error} - If an error occurs while selecting the option.
     * @deprecated - Use DropdownList instead.
     */
    async selectOptionByIndex(selector: string | Locator, index: number) {
        try {
            logger.debug(`Selecting option: ${index} from dropdown list`);
            if (typeof selector === "string") {
                await this.locator(selector).selectOption({ index: index });
            } else {
                await selector.selectOption({ index: index });
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Selects an option from a dropdown list by clicking on the dropdown and then clicking on the option.
     *
     * @param {string | Locator} dropdownSelector - The selector of the dropdown list or a Locator object.
     * @param {string} optionSelector - The selector of the option to be selected.
     * @param {string} option - The text of the option to be selected.
     * @return {Promise<void>} - A Promise that resolves when the option is selected.
     * @throws {Error} - If an error occurs while selecting the option.
     * @deprecated - Use DropdownList instead.
     */
    async selectDivOption(
        dropdownSelector: string | Locator,
        optionSelector: string,
        option: string
    ) {
        try {
            logger.debug(`Selecting div option: ${option} from dropdown list`);
            const dropdownLocator =
                typeof dropdownSelector === "string"
                    ? this.locator(dropdownSelector)
                    : dropdownSelector;
            const isDropdownDisabled = await dropdownLocator.getAttribute(
                "class"
            );
            if (isDropdownDisabled?.includes("Mui-disabled")) {
                await this.waitForTimeout(1000);
            }

            await dropdownLocator.click();

            await this.locatorWithArgs(optionSelector, option).click();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Asserts that an element specified by the given selector is visible.
     *
     * @param selector - The selector or locator of the element to assert visibility for.
     * @param options - Optional wait options for the assertion.
     */
    async assertVisible(selector: string | Locator, options?: IWait) {
        logger.debug(`Asserting element is visible: ${selector}`);

        try {
            await this.sleep(options?.sleep);
            await expect(this.locator(selector)).toBeVisible({
                timeout: options?.timeout || 10000,
            });
            // expect(await this.locator(selector).count()).toBeGreaterThan(0);
        } catch (err) {
            throw new Error(
                `Element is not visible: ${selector}, error: ${err}`
            );
        }
    }

    async assertEnabled(selector: string | Locator, options?: IWait) {
        logger.debug(`Asserting element is enabled: ${selector}`);
        await this.sleep(options?.sleep);
        await expect(this.locator(selector)).toBeEnabled({
            timeout: options?.timeout || 7000,
        });
    }

    async assertDisabled(selector: string | Locator, options?: IWait) {
        logger.debug(`Asserting element is enabled: ${selector}`);
        await this.sleep(options?.sleep);
        await expect(this.locator(selector)).toBeDisabled({
            timeout: options?.timeout || 7000,
        });
    }

    /**
     * Asserts that an element with the specified selector is not visible.
     *
     * @param {string} selector - The selector of the element to assert.
     * @return {Promise<void>} - A Promise that resolves when the assertion is successful.
     */
    async assertNotVisible(selector: string | Locator, options?: IWait) {
        if (options) {
            await this.waitForOptions(options);
        }
        logger.debug(`Asserting element is not visible: ${selector}`);
        await expect(await this.locator(selector)).not.toBeVisible();
    }

    /**
     * Asserts the count of elements matching the given selector.
     *
     * @param selector - The selector to match the elements.
     * @param count - The expected count of elements.
     * @param options - Optional wait options.
     */
    async assertElementCount(
        selector: string | Locator,
        count: number,
        options?: IWait
    ) {
        logger.debug(`Asserting element ${selector} count: ${count}`);
        await this.waitForOptions(options || { timeout: 5000, sleep: 5000 });
        const elements = await this.locator(selector).count();
        expect(elements).toBe(count);
    }

    /**
     * Asserts that the inner text of the element located by the given selector is equal to the specified text.
     *
     * @param {string} selector - The selector of the element to assert.
     * @param {string} text - The text to check for in the inner text of the element.
     * @return {Promise<void>} - A Promise that resolves when the assertion is successful.
     */
    async assertText(selector: string | Locator, text: string) {
        logger.debug(`Asserting element ${selector} has text: ${text}`);
        if (typeof selector === "string") {
            expect(await this.locator(selector).innerText()).toBe(text);
        } else {
            expect(await selector.innerText()).toBe(text);
        }
    }

    /**
     * Asserts that the inner text of the element located by the given selector contains the specified text.
     *
     * @param {string} selector - The selector of the element to assert.
     * @param {string} text - The text to check for in the inner text of the element.
     * @return {Promise<void>} - A Promise that resolves when the assertion is successful.
     */
    async assertTextContains(selector: string | Locator, text: string) {
        expect(await this.locator(selector).innerText()).toContain(text);
    }

    /**
     * Asserts that the attribute of an element with the specified selector contains the specified value.
     *
     * @param {string} selector - The selector of the element to assert.
     * @param {string} attribute - The attribute of the element to check.
     * @param {string} value - The value to check for in the attribute.
     */
    async assertElementAttributeContains(
        selector: string,
        attribute: string,
        value: string
    ) {
        expect(await this.locator(selector).getAttribute(attribute)).toContain(
            value
        );
    }

    /**
     * Asserts that the attribute of an element has the specified value.
     *
     * @param {string | Locator} selector - The selector of the element or a Locator object.
     * @param {string} attribute - The attribute of the element to check.
     * @param {string} value - The value to check for in the attribute.
     * @return {Promise<void>} - A Promise that resolves when the assertion is successful.
     */
    async assertElementAttributeHasValue(
        selector: string | Locator,
        attribute: string,
        value: string
    ) {
        if (typeof selector === "string") {
            expect(await this.locator(selector).getAttribute(attribute)).toBe(
                value
            );
        } else {
            expect(await selector.getAttribute(attribute)).toBe(value);
        }
    }

    /**
     * Asserts that an element identified by the given selector has the specified attribute.
     * @param selector - The selector or locator of the element.
     * @param attribute - The name of the attribute to check.
     */
    async assertElementHasAttribute(
        selector: string | Locator,
        attribute: string
    ) {
        expect(
            await this.locator(selector).getAttribute(attribute)
        ).not.toBeNull();
    }

    // Asserts for single value

    /**
     * Asserts that the actual value is equal to the expected value.
     * Throws an error with a custom message if the values are not equal.
     *
     * @param actual - The actual value to compare.
     * @param expected - The expected value to compare against.
     */
    assertEquals(actual: any, expected: any, options?: { message?: string }) {
        expect(actual, {
            message:
                options?.message ||
                `Actual: ${actual} is equal to expected: ${expected}`,
        }).toEqual(expected);
    }

    /**
     * Asserts that the actual value is not equal to the expected value.
     *
     * @param actual - The actual value to be compared.
     * @param expected - The expected value to be compared against.
     */
    async assertNotEquals(
        actual: any,
        expected: any,
        options?: { message?: string }
    ) {
        expect(
            actual,
            options || {
                message: `Actual: ${actual} is not equal to expected: ${expected}`,
            }
        ).not.toEqual(expected);
    }

    /**
     * Asserts that the actual value is greater than the expected value.
     *
     * @param actual - The actual value to be compared.
     * @param expected - The expected value to compare against.
     */
    assertGreater(actual: number, expected: number) {
        expect(actual).toBeGreaterThan(expected);
    }

    /**
     * Asserts that the actual value is greater than or equal to the expected value.
     *
     * @param actual - The actual value to be compared.
     * @param expected - The expected value to compare against.
     */
    assertGreaterOrEqual(actual: number, expected: number) {
        expect(actual).toBeGreaterThanOrEqual(expected);
    }

    /**
     * Asserts that the actual value is less than the expected value.
     *
     * @param actual - The actual value to compare.
     * @param expected - The expected value to compare against.
     */
    assertLess(actual: number, expected: number) {
        expect(actual).toBeLessThan(expected);
    }

    /**
     * Asserts that the actual value is less than or equal to the expected value.
     *
     * @param actual - The actual value to be compared.
     * @param expected - The expected value to compare against.
     */
    assertLessOrEqual(actual: number, expected: number) {
        expect(actual).toBeLessThanOrEqual(expected);
    }

    /**
     * Asserts that the given value is true.
     * @param actual - The value to be checked.
     */
    assertTrue(actual: boolean, options?: { message?: string }) {
        expect(actual, {
            message:
                options?.message ||
                `Expected value to be true, but got ${actual}`,
        }).toBeTruthy();
    }

    /**
     * Asserts that the given value is false.
     *
     * @param actual - The value to be checked.
     */
    assertFalse(actual: boolean) {
        expect(actual).toBeFalsy();
    }

    /**
     * Asserts that the given value is null.
     *
     * @param actual - The value to be checked.
     */
    assertNull(actual: any) {
        expect(actual).toBeNull();
    }

    /**
     * Asserts that the given value is not null.
     * Throws an error if the value is null.
     *
     * @param actual - The value to be checked.
     */
    assertNotNull(actual: any) {
        expect(actual).not.toBeNull();
    }

    /**
     * Asserts that the given value is undefined.
     *
     * @param actual - The value to be checked.
     */
    assertUndefined(actual: any) {
        expect(actual).toBeUndefined();
    }

    /**
     * Asserts that the given value is not undefined.
     * @param actual - The value to be checked.
     */
    assertNotUndefined(actual: any) {
        expect(actual).not.toBeUndefined();
    }

    /**
     * Asserts that the given actual string is equal to the expected string.
     *
     * @param {string} actual - The actual string to compare.
     * @param {string} expected - The expected string to compare against.
     * @return {Promise<void>} - A promise that resolves when the assertion is successful.
     * @throws {Error} - If the actual string is not equal to the expected string.
     */
    assertStringContains(actual: string, expected: string) {
        expect(actual).toContain(expected);
    }

    /**
     * Asserts that a string does not contain the expected substring.
     *
     * @param actual - The actual string to check.
     * @param expected - The expected substring that should not be present in the actual string.
     */
    assertStringNotContains(actual: string, expected: string) {
        expect(actual).not.toContain(expected);
    }

    // Asserts for array
    /**
     * Asserts that two arrays match each other.
     *
     * @param actual - The actual array.
     * @param expected - The expected array.
     */
    async assertArrayMatches(actual: Array<any>, expected: Array<any>) {
        logger.debug(`Asserting array matches: ${actual} and ${expected}`);
        this.assertArrayContains(actual, expected);
        this.assertArrayContains(expected, actual);
    }

    /**
     * Asserts that the actual array contains all the elements from the expected array.
     *
     * @param actual - The actual array to be checked.
     * @param expected - The expected array containing the elements to be checked against.
     */
    async assertArrayContains(actual: Array<any>, expected: Array<any>) {
        const isTrue = actual.every((value) => expected.includes(value));
        expect(isTrue, {
            message: `Actual array ${actual} does not contain expected array ${expected}`,
        }).toBeTruthy();
    }

    /**
     * Asserts that an array is sorted according to the specified options.
     *
     * @param arr - The array to be checked.
     * @param options - The options specifying the sorting order.
     */
    assertSorted(arr: any[], options: ISort) {
        expect(() => checkSorted(arr, options)).not.toThrowError();
    }

    /**
     * Asserts that the given array is sorted in ascending order.
     *
     * @param {any[]} arr - The array to be checked for ascending order.
     * @return {Promise<void>} - A promise that resolves when the assertion is successful.
     * @throws {Error} - If the array is not sorted in ascending order.
     * @deprecated - Use assertSorted instead.
     */
    async assertAscendingOrder(arr: any[]) {
        expect(arr).toEqual(expect.arrayContaining(arr.sort()));
    }

    /**
     * Asserts that the given array is sorted in descending order.
     *
     * @param {any[]} arr - The array to be checked for descending order.
     * @return {Promise<void>} - A promise that resolves when the assertion is successful.
     * @throws {Error} - If the array is not sorted in descending order.
     * @deprecated - Use assertSorted instead.
     */
    async assertDescendingOrder(arr: any[]) {
        expect(arr).toEqual(expect.arrayContaining(arr.sort().reverse()));
    }

    /**
     * Asserts that an element with the specified selector is active.
     *
     * @param {string} selector - The selector of the element to assert.
     */
    async assertActive(selector: string | Locator) {
        try {
            if (typeof selector === "string") {
                const doesElementClassContainsActive = await this._page
                    ?.locator(selector)
                    .evaluate((element) => {
                        return element.classList.contains("active");
                    });
                expect(doesElementClassContainsActive).toBeTruthy();
            } else {
                const doesElementClassContainsActive = await selector.evaluate(
                    (element) => {
                        return element.classList.contains("active");
                    }
                );
                expect(doesElementClassContainsActive).toBeTruthy();
            }
        } catch (err) {
            logger.error(err);
        }
    }

    // Checkbox methods

    /**
     * Checks or unchecks an element based on the provided selector.
     *
     * @param selector - The selector or locator of the element to check.
     * @param value - Optional. The value indicating whether to check or uncheck the element. If not provided, the element will be checked.
     */
    async check(selector: string | Locator, value?: boolean | undefined) {
        logger.debug(`Checking element by selector: ${selector}`);
        const checkElement = this.locator(selector);
        if (value === undefined) {
            await checkElement.check();
        } else if (value) {
            await checkElement.check();
        } else {
            await checkElement.uncheck();
        }
    }

    /**
     * Unchecks a checkbox element identified by the given selector.
     * If the element is already unchecked, no action is performed.
     *
     * @param selector - The selector or locator of the checkbox element.
     */
    async uncheck(selector: string | Locator) {
        try {
            logger.debug(`Unchecking element by selector: ${selector}`);
            if (await this.locator(selector).isChecked()) {
                await this.locator(selector).uncheck();
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Checks if the specified element is checked.
     *
     * @param selector - The selector or locator of the element.
     * @returns A promise that resolves to a boolean indicating whether the element is checked.
     */
    async isChecked(selector: string | Locator) {
        try {
            logger.debug(`Checking if element is checked: ${selector}`);
            return await this.locator(selector).isChecked();
        } catch (err) {
            logger.error(err);
        }
    }

    async isState(
        selector: Locator | string,
        state: "visible" | "hidden" | "enabled" | "disabled" | "editable"
    ) {
        if (state === "disabled") {
            return this.locator(selector).isDisabled();
        }
        if (state === "hidden") {
            return this.locator(selector).isHidden();
        }
        if (state === "visible") {
            return this.locator(selector).isVisible();
        }
        if (state === "enabled") {
            return this.locator(selector).isEnabled();
        }
        if (state === "editable") {
            return this.locator(selector).isEditable();
        }
        throw new Error(`State: ${state} is not supported`);
    }

    /**
     * Pauses the execution for a specified amount of time.
     * @param time - The duration to sleep in milliseconds. If not provided, defaults to 200 milliseconds.
     */
    async sleep(time?: number) {
        try {
            const _time = time || 200;
            logger.trace(`Sleeping for: ${_time}...\r`);
            await new Promise((resolve) => setTimeout(resolve, _time));
            logger.trace("wake up!");
            return;
        } catch (err) {
            logger.error(err);
        }
    }

    //API methods

    /**
     * Retrieves API data from the specified URL. Use it immediately after an actions. Avoid using it after other wait.
     * @param url - The URL to fetch the API data from.
     * @returns A Promise that resolves to the JSON response from the API.
     */
    async catchApiData(
        url: string,
        method?: "GET" | "POST" | "DELETE" | "PUT"
    ): Promise<any> {
        logger.debug(`Getting API data: ${url}`);
        const response = await this._page?.waitForResponse((response) => {
            if (method) {
                if (response.request().method() !== method) {
                    return false;
                }
            }
            return response.url().includes(url);
        });
        return await response?.json();
    }

    /**
     * Retrieves the status code of an API response for the specified URL. Use it immediately after an actions. Avoid using it after other wait.
     * @param url - The URL to check the API response status for.
     * @returns A promise that resolves to the status code of the API response.
     */
    async catchApiStatus(url: string): Promise<number> {
        logger.debug(`Getting API status: ${url}`);
        const response = await this._page?.waitForResponse((response) => {
            return response.url().includes(url);
        });
        return await response?.status();
    }

    /**
     * Retrieves the API response for the specified URL. Use it immediately after an actions. Avoid using it after other wait.
     * @param url - The URL to retrieve the API response from.
     * @returns A promise that resolves to an object containing the status and text of the response.
     */
    async catchApiResponse(url: string): Promise<any> {
        logger.debug(`Getting API response: ${url}`);
        const response = await this._page?.waitForResponse((response) => {
            return response.url().includes(url);
        });
        return response;
    }

    // Wait methods

    /**
     * Waits for a network request with the specified URL or regular expression pattern.
     * @param url - The URL or regular expression pattern of the request to wait for.
     */
    async waitForRequest(url: string | RegExp) {
        logger.debug(`Waiting for request: ${url}`);
        if (typeof url === "string") {
            await this._page?.waitForRequest((request) => {
                return request.url().includes(url);
            });
        } else {
            await this._page?.waitForRequest(url);
        }
    }
    async waitForResponse(url: string | RegExp, option?: { timeout?: number }) {
        logger.debug(`Waiting for response: ${url}`);
        if (typeof url === "string") {
            await this._page?.waitForResponse((response) => {
                return response.url().includes(url);
            }, option);
        } else {
            await this._page?.waitForResponse(url, option);
        }
    }
    async waitForElementsCount(
        selector: string | Locator,
        count: number,
        options?: IWait
    ) {
        logger.debug(`Waiting for selector count: ${selector} to be: ${count}`);
        await this.waitForOptions(options || { timeout: 10000 });
        setTimeout(async () => {
            await this.assertElementCount(selector, count);
        }, options?.timeout || 10000);
    }

    async waitForElementHasText(
        selector: string | Locator,
        text: string | RegExp,
        options?: IWait
    ) {
        logger.debug(`Waiting for selector: ${selector} to have text: ${text}`);
        let timeout = options?.timeout || 10000;
        const interval = options?.interval || 500;
        while (timeout > 0) {
            logger.trace(`Waiting for selector: ${selector}, try: ${timeout}`);
            try {
                const elementText = await this.getTextContent(selector, {
                    timeout: 500,
                });
                if (typeof text === "string") {
                    if (elementText?.includes(text)) {
                        return;
                    }
                }
                if (text instanceof RegExp) {
                    if (elementText?.match(text)) {
                        return;
                    }
                }
                timeout -= interval;
                await this.sleep(interval);
                logger.debug(`Text ${elementText} not matched, retrying...`);
            } catch (e: any) {
                logger.debug(
                    "Failed to getTextContent from element, retrying..."
                );
                timeout -= interval;
                await this.sleep(interval);
            }
        }
        throw new Error(
            `Element not found: ${selector}, options: ${JSON.stringify({
                text: text,
                timeout: timeout,
            })}`
        );
    }

    async waitForOptions(options?: IWait) {
        if (options?.locator) {
            // await this.waitForSelector(options.locator, options);
        } else if (options?.state) {
            await this.waitForLoadState(options.state);
        }
        if (options?.sleep) {
            await this.sleep(options.sleep);
        }
        if (options?.timeout) {
            await this.waitForTimeout(options.timeout);
        }
    }

    /**
     * Waits for the specified time in milliseconds.
     * @param {number} time - The time to wait in milliseconds.
     */
    async waitForTimeout(time: number) {
        try {
            logger.debug(`Waiting for timeout: ${time}`);
            await this._page?.waitForTimeout(time);
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Waits for the DOMContentLoaded event.
     */
    async waitForDomContentLoaded() {
        await this._page?.waitForLoadState("domcontentloaded");
        logger.debug("Dom content loaded");
    }

    /**
     * Waits for the network to be idle.
     */
    async waitForNetworkIdle() {
        await this._page?.waitForLoadState("networkidle");
        logger.debug("Network idle");
    }

    async waitForLoadState(state: "load" | "domcontentloaded" | "networkidle") {
        logger.debug(`Wait for load state: ${state}`);
        await this._page?.waitForLoadState(state);
    }

    /**
     * Waits for an element with the specified selector to appear in the DOM.
     *
     * @param {string | Locator} selector - The selector of the element to wait for.
     * @return {Promise<void>} A promise that resolves when the element is found in the DOM.
     */
    async waitForSelector(
        selector: string | Locator,
        options?: IWaitForSelector
    ) {
        try {
            logger.debug(
                `Waiting for selector: ${selector} to options: ${JSON.stringify(
                    options
                )}`
            );
            const interval = options?.interval || 500;
            let timeout = options?.timeout || 10000;
            const count = options?.count;
            let min = undefined;
            let max = undefined;
            if (!count) {
                min = options?.min || 1;
                max = options?.max;
            }
            let repeat = 0;
            let total = 0;
            while (timeout > 0) {
                logger.trace(
                    `Waiting for selector: ${selector}, try: ${repeat}`
                );
                let elements: Array<Locator> = [];
                try {
                    elements = await this.locator(selector).all();
                } catch (e: any) {
                    if (
                        e.message.includes(
                            "Execution context was destroyed, most likely because of a navigation"
                        )
                    ) {
                        logger.debug("Locator.all() failed, retrying...");
                        timeout -= interval;
                        repeat += 1;
                        await this.sleep(interval);
                        continue;
                    }
                    throw e;
                }
                logger.trace(`Total elements found: ${total}`);
                if (options?.text) {
                    elements = elements.filter(
                        async (element) =>
                            (await element.textContent()) === options.text
                    );
                }
                if (options?.containedText) {
                    elements = elements.filter(async (element) =>
                    // ((await element.textContent()) || "").includes(
                    // 	options.containedText || "",
                    // ),
                    {
                        try {
                            const text = await element.textContent();
                            return text?.includes(
                                options.containedText || ""
                            );
                        } catch {
                            return false;
                        }
                    }
                    );
                }
                if (options?.property) {
                    elements = elements.filter(
                        async (element) =>
                            (await element.getAttribute(
                                options.property?.key as string
                            )) !== null
                    );
                }
                if (options?.property?.value) {
                    elements = elements.filter(
                        async (element) =>
                            (await element.getAttribute(
                                options.property?.key as string
                            )) === options?.property?.value
                    );
                }
                if (options?.property?.containedValue) {
                    elements = elements.filter(async (element) =>
                        (
                            await element.getAttribute(
                                options.property?.key as string
                            )
                        )?.includes(options?.property?.containedValue || "")
                    );
                }
                if (options?.excludedTexts) {
                    const _elements = await Promise.all(
                        elements.map(async (element) => {
                            const text = await element.textContent();
                            const res = options.excludedTexts?.some(
                                (excludedText) => text?.includes(excludedText)
                            );
                            return { element, include: !res };
                        })
                    );
                    elements = _elements
                        .filter((item) => item.include)
                        .map((item) => item.element);
                }
                if (options?.state) {
                    elements = elements.filter(
                        async (element) =>
                            await this.isState(
                                element,
                                options.state || "visible"
                            )
                    );
                }
                total = elements.length;
                if (count) {
                    if (total === count) {
                        return;
                    }
                }
                if (min && max) {
                    if (total >= min && total <= max) {
                        return;
                    }
                } else if (min && total >= min) {
                    return;
                } else if (max && total <= max) {
                    return;
                }
                timeout -= interval;
                repeat += 1;
                await this.sleep(interval);
            }
            throw new Error(
                options?.message ||
                `Element not found: ${selector}, options: ${JSON.stringify({
                    count: count,
                    min: min,
                    max: max,
                    text: options?.text,
                    containedText: options?.containedText,
                    property: options?.property,
                    state: options?.state,
                })}`
            );
        } catch (err) {
            throw new Error(`Element not found: ${selector}, error: ${err}`);
        }
    }

    /**
     * Waits for a selector to be ready for interaction.
     * @param {string | Locator} selector - The selector of the element to wait for.
     * @param {Object} [options] - Optional parameters for waiting.
     * @return {Promise<void>} A promise that resolves when the element is found in the DOM and ready for interaction.
     */
    async waitForFunction(
        selector: string | Locator,
        options?: { timeout?: number; polling?: "raf" | number }
    ) {
        try {
            if (typeof selector === "string") {
                logger.debug(
                    `Waiting for selector: ${selector} with options: ${JSON.stringify(
                        options
                    )}`
                );
                await this._page?.waitForFunction(
                    (sel) => {
                        const element = document.querySelector(
                            sel
                        ) as HTMLElement;
                        return element && element.offsetParent !== null;
                    },
                    selector,
                    options
                );
            } else {
                await selector.waitFor(options);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Waits for the specified selector to have a specific count of elements based on the provided options.
     *
     * @param selector - The selector to wait for, can be a string or a Locator object.
     * @param options - The options for waiting, including timeout, interval, count, minimum, and maximum.
     * @throws If the count does not match the specified options within the timeout period.
     */
    async waitForSelectorCount(
        selector: string | Locator,
        options: IWaitForSelectorCount
    ) {
        options.timeout = options.timeout || 10000;
        options.interval = options.interval || 1000;
        let count = 0;
        if ((options.minimum || options.maximum) && options.count) {
            throw new Error(
                "Please provide either count or minimum and maximum options"
            );
        }
        while (options.timeout > 0) {
            logger.debug(
                `Waiting for selector count: ${selector} for options: ${JSON.stringify(
                    options
                )}`
            );
            count = await this.locator(selector).count();
            if (typeof options.count === "number") {
                if (count === options.count) {
                    logger.debug(`Selector count matched: ${count}`);
                    return;
                }
            }
            if (Array.isArray(options.count)) {
                if (options.count.includes(count)) {
                    logger.debug(`Selector count matched: ${count}`);
                    return;
                }
            }
            if (options.minimum && options.maximum) {
                if (count >= options.minimum && count <= options.maximum) {
                    logger.debug(`Selector count matched: ${count}`);
                    return;
                }
            } else if (options.minimum && count >= options.minimum) {
                logger.debug(`Selector count matched: ${count}`);
                return;
            } else if (options.maximum && count <= options.maximum) {
                logger.debug(`Selector count matched: ${count}`);
                return;
            }
            options.timeout -= options.interval;
            await this.sleep(options.interval);
        }
        throw new Error(
            `Last count is ${count}, not matched: ${selector} for options: ${JSON.stringify(
                options
            )}`
        );
    }

    async waitForAPILoaded(
        url: string,
        options?: { timeout?: number; renderTime?: number }
    ) {
        try {
            logger.debug(`Waiting for API loaded: ${url}`);
            await this._page?.waitForResponse(
                (response) => {
                    return response.url().includes(url);
                },
                { timeout: options?.timeout || 10000 }
            );
            await this.sleep(options?.renderTime || 100);
        } catch (err) {
            logger.error(err);
        }
    }

    // Mouse methods

    async move(x: number, y: number) {
        logger.debug(`Moving mouse to: ${x}, ${y}`);
        await this._page.mouse.move(x, y);
    }
    async moveToElement(selector: string | Locator) {
        logger.debug(`Moving mouse to element: ${selector}`);
        await this.locator(selector).hover();
    }
    // Scroll methods

    /**
     * Scrolls down by the specified distance.
     * @param {number} distance - The distance to scroll down.
     */
    async scrollDown(distance: number) {
        try {
            logger.debug(`Scrolling down: ${distance}`);
            await this._page?.mouse.wheel(0, distance);
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Scrolls up by the specified distance.
     * @param {number} distance - The distance to scroll up.
     */
    async scrollUp(distance: number) {
        try {
            logger.debug(`Scrolling up: ${distance}`);
            await this._page?.mouse.wheel(0, -distance);
        } catch (err) {
            logger.error(err);
        }
    }

    async scrollToElement(selector: string | Locator) {
        try {
            logger.debug(`Scrolling to element: ${selector}`);
            await this.locator(selector).scrollIntoViewIfNeeded();
        } catch (err) {
            logger.error(err);
        }
    }

    // Evaluation methods

    /**
     * Evaluates the specified script in the context of the page.
     * @param {string} script - The script to evaluate.
     */
    async evaluateScript(script: string) {
        try {
            logger.debug(`Evaluating script: ${script}`);
            await this._page?.evaluate(script);
        } catch (err) {
            logger.error(err);
        }
    }

    // Screenshot methods

    /**
     * Captures a screenshot of the page and saves it to the specified path.
     * @param {string} path - The path to save the screenshot.
     */
    async captureScreenshot(path: string) {
        try {
            logger.debug(`Capturing screenshot and saving: ${path}`);
            await this._page?.screenshot({ path: path });
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Takes a screenshot of the current page.
     * @returns {Promise<Buffer | void>} A promise that resolves to a Buffer containing the screenshot image data, or void if an error occurs.
     */
    async screenshot(title?: string) {
        try {
            const imageName = `screenshot-${Date.now()}-${randomCode(8)}.png`;
            logger.debug(`Capturing screenshot: ${imageName}`);
            return await this._page?.screenshot({
                path: `playwright-report/data/screenshots/${imageName}.png`,
                timeout: 5000,
            });
        } catch (err) {
            logger.error(`Screenshot error: ${err}`);
        }
    }

    /**
     * Captures a screenshot of the specified element.
     *
     * @param selector - The selector or locator of the element to capture.
     * @param name - Optional. The name of the screenshot file. If not provided, a default name will be generated.
     * @returns The path to the captured screenshot file.
     */
    async captureElement(selector: string | Locator, name?: string) {
        try {
            logger.debug(`Capturing element screenshot: ${selector}`);
            const imageName =
                name ||
                `element-screenshot-${Date.now()}-${randomCode(16)}.png`;
            const path = `reports/elements-screenshots/${imageName}`;
            await this.locator(selector).screenshot({ path: path });
            return path;
        } catch (err) {
            logger.error(err);
        }
    }

    // Element methods

    /**
     * Returns a Locator object for the specified selector.
     * @param selector - The selector string or Locator object.
     * @param options - Optional parameters for locating the element.
     * @returns The Locator object for the specified selector.
     * @throws Error if the page is not initialized.
     */
    locator(selector: string | Locator, options?: ILocator): Locator {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        if (typeof selector !== "string" && options?.children) {
            throw new Error(
                "Cannot use children option with a Locator object. Please provide a selector string instead."
            );
        }
        let frame: FrameLocator | Page = this._page;
        if (options?.framesChain && options.framesChain.length > 0) {
            for (let i = 0; i < options.framesChain.length; i++) {
                frame = frame.frameLocator(options.framesChain[i]);
            }
        }
        if (typeof selector === "string") {
            let _selector = frame.locator(selector);
            for (const child of options?.children || []) {
                _selector = _selector.locator(child);
            }
            return _selector;
        }
        return selector;
    }

    /**
     * Replaces the placeholders in the given selector with the provided arguments and returns a Locator object.
     *
     * @deprecated This method is deprecated and will be removed in future versions. Please use the `locator` method instead.
     *
     * @param selector - The selector string with placeholders.
     * @param args - The arguments to replace the placeholders in the selector.
     * @returns A Locator object representing the updated selector.
     * @throws Error if the page is not initialized.
     */
    locatorWithArgs(selector: string, ...args: any[]): Locator {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        let _selector = selector;
        for (let i = 0; i < args.length; i++) {
            _selector = _selector.replace(`$${i}`, args[i]);
        }
        return this.locator(_selector);
    }

    /**
     * Gets the XPath from a locator.
     *
     * @deprecated This method is deprecated and will be removed in future versions. The author is really confused about the usage of this method.
     * Please use an alternative method instead.
     *
     * @param locator - The locator to extract the XPath from.
     * @returns The XPath string.
     */
    getXpathFromLocator(locator: Locator): string {
        let locatorString = locator.toString().replace("locator('", "");
        if (locatorString.endsWith("')")) {
            locatorString = locatorString.slice(0, -2);
        }
        locatorString = locatorString.replace(/\\/, "").replace(/'/, '"');
        logger.debug(`xpath: ${locatorString}`);
        return locatorString;
    }

    /**
     * Retrieves all locators for elements that match the specified selector.
     *
     * @param {string | Locator} selector - The selector of the elements.
     * @return {Promise<Locator[]>} - A promise that resolves to an array of locators for matching elements.
     * @throws {Error} - If the page is not initialized.
     */
    async locatorAll(selector: string | Locator): Promise<Locator[]> {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        try {
            if (typeof selector === "string") {
                return await this.locator(selector).all();
            }
            return await selector.all();
        } catch (err) {
            logger.error(err);
            throw err;
        }
    }

    /**
     * Checks if an element with the specified selector is visible.
     * @param {string} selector - The selector of the element.
     * @returns {Promise<boolean>} - True if the element is visible, false otherwise.
     */
    async isVisible(
        selector: string | Locator,
        options?: IWait | { timeout: 1000 }
    ) {
        await this.waitForOptions(options);
        try {
            return await this.locator(selector).isVisible();
        } catch (err: any) {
            if (
                err.message.includes(
                    "Target page, context or browser has been closed"
                )
            ) {
                logger.warn(
                    `Page is closed before checking selector visibility: ${selector}`
                );
                return false;
            }
            throw err;
        }
    }

    /**
     * Checks if the elements matching the given selector are visible on the page.
     *
     * @param selector - The selector string or Locator object to match the elements.
     * @param options - Optional parameter to specify the type of visibility check.
     *                  If options.type is set to "oneof", it checks if at least one element is visible.
     *                  If options.type is set to "all", it checks if all elements are visible.
     * 					If options.type is set to "none", it checks if none of the elements are visible.
     *                  If options is not provided or options.type is not set, it checks if no elements are visible.
     * @returns A boolean indicating whether the elements are visible based on the specified options.
     * @throws Error if the page is not initialized.
     */
    async areVisible(selector: string | Locator, options?: IList) {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        const selections = await this.locatorAll(selector);
        if (selections.length === 0) {
            return false;
        }
        if (!options || options?.type === "oneof") {
            return Promise.all(
                selections.map(async (selection) => await selection.isVisible())
            ).then((results) => results.some(Boolean));
        }
        if (options?.type === "all") {
            return Promise.all(
                selections.map(async (selection) => await selection.isVisible())
            ).then((results) => results.every(Boolean));
        }
        if (options?.type === "none") {
            return Promise.all(
                selections.map(
                    async (selection) => !(await selection.isVisible())
                )
            ).then((results) => results.every(Boolean));
        }
        return false; // default return statement
    }

    async isEnabled(selector: string | Locator) {
        return await this.locator(selector).isEnabled();
    }

    /**
     * Highlights an element with the specified xpath by adding a red border around it.
     * @param {string} xpath - The xpath of the element to highlight.
     */
    async highlightElement(xpath: string) {
        try {
            logger.debug(`Highlighting element: ${xpath}`);
            await this._page.waitForSelector(`xpath=${xpath}`);
            await this._page.evaluate((xpath) => {
                const element = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                if (element) {
                    const htmlElement = element as HTMLElement;
                    htmlElement.style.border = "2px solid red";
                }
            }, xpath);
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Highlights an element with the specified xpath, captures a screenshot, and saves it to the specified path.
     * @param {string} xpath - The xpath of the element to highlight.
     * @param {string} path - The path to save the screenshot.
     */
    async highlightElementAndCaptureScreenshot(xpath: string, path: string) {
        try {
            logger.debug(
                `Higlighting element and capturing screenshot: ${path}`
            );
            await this.highlightElement(xpath);
            await this.captureScreenshot(path);
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Retrieves the center point of an element specified by a selector or a Locator.
     *
     * @param {string | Locator} selector - The selector or Locator of the element.
     * @return {Promise<{x: number, y: number}>} A Promise that resolves to an object containing the x and y coordinates of the center point.
     * @throws {Error} If the page is not initialized.
     */
    async getElementCenterPoint(selector: string | Locator) {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        try {
            if (typeof selector === "string") {
                return await this._page
                    .locator(selector)
                    .boundingBox()
                    .then((box) => {
                        return {
                            x: (box?.x ?? 0) + (box?.width ?? 0) / 2,
                            y: (box?.y ?? 0) + (box?.height ?? 0) / 2,
                        };
                    });
            }
            return await selector.boundingBox().then((box) => {
                return {
                    x: (box?.x ?? 0) + (box?.width ?? 0) / 2,
                    y: (box?.y ?? 0) + (box?.height ?? 0) / 2,
                };
            });
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Returns the dimensions (width and height) of an element with the specified selector.
     *
     * @param {string | Locator} selector - The selector of the element.
     * @returns {Promise<{width: number, height: number}>} - The dimensions of the element.
     * @throws {Error} If the page is not initialized.
     */
    async getElementDimensions(selector: string | Locator) {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        try {
            if (typeof selector === "string") {
                return await this._page
                    .locator(selector)
                    .boundingBox()
                    .then((box) => {
                        return {
                            width: box?.width,
                            height: box?.height,
                        };
                    });
            }
            return await selector.boundingBox().then((box) => {
                return {
                    width: box?.width,
                    height: box?.height,
                };
            });
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Returns the number of elements with the specified selector.
     *
     * @param {string | Locator} selector - The selector of the elements.
     * @return {Promise<number>} - The number of elements.
     * @throws {Error} - If the page is not initialized.
     */
    async getElementsCount(selector: string | Locator) {
        if (!this._page) {
            throw new Error("Page is not initialized");
        }
        try {
            logger.debug(`Getting elements count: ${selector}`);
            if (typeof selector === "string") {
                return await this._page
                    .locator(selector)
                    .count()
                    .then((count) => {
                        return count;
                    });
            }
            return await selector.count().then((count) => {
                return count;
            });
        } catch (err) {
            logger.error(err);
        }
    }

    // Browser methods

    /**
     * Closes the browser.
     */
    async close() {
        try {
            logger.debug("Closing browser");
            await this._page?.close();
        } catch (err) {
            logger.error(err);
        }
    }

    async download(selector: string | Locator, folderPath?: string) {
        const _folderPath = folderPath || "./playwright-report/downloads/";
        logger.debug(`Downloading file and save to: ${_folderPath}`);
        const downloadPromise = this._page?.waitForEvent("download");
        await this.locator(selector).click();
        const download = await downloadPromise;
        await download.saveAs(_folderPath + download.suggestedFilename());
        return _folderPath + download.suggestedFilename();
    }

    async upload(selector: string | Locator, filePath: string | string[]) {
        const fileChooserPromise = this._page.waitForEvent("filechooser");
        await this.locator(selector).click();
        const fileChooser = await fileChooserPromise;
        if (typeof filePath === "string") {
            await fileChooser.setFiles(
                path.join(__dirname.replace("/src/base", ""), filePath)
            );
        } else {
            await fileChooser.setFiles(
                filePath.map((file) =>
                    path.join(__dirname.replace("/src/base", ""), file)
                )
            );
        }
    }
    async uploadMultipleFiles(selector: string | Locator, filePaths: string[]) {
        const fileChooserPromise = this._page.waitForEvent("filechooser");
        await this.locator(selector).click();
        const fileChooser = await fileChooserPromise;

        // Chuyển đổi các đường dẫn tệp tin thành các đường dẫn tuyệt đối
        const absoluteFilePaths = filePaths.map((filePath) =>
            path.join(__dirname.replace("/src/base", ""), filePath)
        );

        await fileChooser.setFiles(absoluteFilePaths);
    }
    async printPageToPDF(path: string) {
        await this._page.emulateMedia({ media: "print" });
        this._page.pdf({
            path: path,
            format: "A4",
            printBackground: true,
        });
        return path;
    }
}
export function extractSelector(locator: Locator) {
    const selector = locator.toString();
    const parts = selector.split("@");
    if (parts.length !== 2) {
        throw Error("extractSelector: susupect that this is not a locator");
    }
    if (parts[0] !== "Locator") {
        throw Error("extractSelector: did not find locator");
    }
    return parts[1];
}
