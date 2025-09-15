import { type Locator, type Page } from "@playwright/test";
import moment from "moment";
import { IRoleProfile } from "src/types/profile";
import { deepEqual } from "src/utils/compare";
import logger from "src/utils/logger";
import { IRange, checkRange, isInRange } from "src/utils/range";
import { ISort, checkSorted, isSorted } from "src/utils/sort";
import {
    IDate,
    convertDateStringToIDate,
    convertIDateToDateFormat,
    getDateFormat,
    isValidDate,
    isValidDateString,
} from "src/utils/timedate";
import {
    Addtiontional,
    Grid,
    GridComposite,
    GridData,
    IScanTable,
} from "src/utils/type";
import BaseComponent from "./base-component";
import BasePage from "./base-page";

/**
 * Represents a widget in the UI automation framework.
 */
export interface IWidget extends IRoleProfile {
    /**
     * The root element of the widget.
     */
    root?: string | Locator;

    /**
     * The trigger element of the widget, which is used to open the widget.
     */
    trigger?: string | Locator;
}
interface IRow {
    [key: string]: any;
}
/**
 * Represents a base widget component.
 * This class use for create a new widget component, including Navbar, Toolbar, Sidebar, Modal, Popup, Tab, Dropdown, Pagination, Datepicker, Card, etc.
 * The Widget class extends the BaseComponent class and adds widget-specific fields like xpath.
 */

export default class Widget extends BaseComponent {
    protected root?: string | Locator;
    protected trigger?: string | Locator;
    /**
     * Creates a new instance of the Widget class.
     * @param page The Playwright page object.
     * @param root The XPath selector for the widget.
     */
    constructor(page: Page | BaseComponent, options?: IWidget) {
        super(page instanceof BaseComponent ? page.getPage() : page, options);
        this.root = options?.root;
        this.trigger = options?.trigger;
    }
    getRoot() {
        return this.root;
    }
    getTrigger() {
        return this.trigger;
    }
    async checkIn(): Promise<void> {
        if (this.trigger) {
            await this.assertVisible(this.trigger);
        }
    }
}
interface IDropdownList extends IList {
    txtSearch?: string | Locator;
    btnApply?: string | Locator;
    btnCancel?: string | Locator;
    btnClear?: string | Locator;
    hideTriggerAfterSelected?: boolean;
    trigger: string | Locator;
    useTriggerClass?: boolean;
    useTriggerAriaExpanded?: boolean;
}
interface IWait {
    sleep?: number;
}
/**
 * Represents the options for a select widget.
 */
interface ISelect extends IWait {
    /**
     * The search string used to filter the options in the select widget.
     */
    search?: string;

    /**
     * Indicates whether a result is required to be selected in the select widget.
     */
    resultRequired?: boolean;

    /**
     * The time taken to render the select widget.
     */
    renderTime?: number;

    /**
     * Contains the text to be selected.
     */
    contained?: boolean;

    /**
     * Click force?
     */
    force?: boolean;
}
/**
 * Represents the options for checking a widget.
 */
interface ICheck {
    /**
     * Specifies whether only the check action should be performed.
     */
    onlyCheck?: boolean;

    /**
     * Specifies the sleep duration in milliseconds before performing the check action.
     */
    sleep?: number;

    /**
     * Specifies the time in milliseconds to wait for the widget to render before performing the check action.
     */
    renderTime?: number;
    contained?: boolean;
}
export class DropdownList extends Widget {
    protected rowsLocator: Locator | string;
    private txtSearch: Locator | string | undefined;
    private btnApply: Locator | string | undefined;
    private hideTriggerAfterSelected: boolean;
    private btnCancel: Locator | string | undefined;
    private btnClear: Locator | string | undefined;
    protected trigger: string | Locator;
    private useTriggerClass: boolean;
    private useTriggerAriaExpanded: boolean;
    private checkbox?: Checkbox;
    constructor(page: Page | BaseComponent, options: IDropdownList) {
        super(page, options);
        this.trigger = options.trigger;
        this.rowsLocator = options.rowsLocator;
        this.txtSearch = options.txtSearch;
        this.btnApply = options.btnApply;
        this.btnCancel = options.btnCancel;
        this.btnClear = options.btnClear;
        this.hideTriggerAfterSelected =
            options.hideTriggerAfterSelected || true;
        this.useTriggerClass = options.useTriggerClass || false;
        this.useTriggerAriaExpanded = options.useTriggerAriaExpanded || false;
    }
    async assertOpen() {
        if (this.hideTriggerAfterSelected) {
            await this.assertNotVisible(this.locator(this.trigger));
        } else {
            await this.assertVisible(this.locator(this.trigger));
        }
        const rows = await this.locator(this.rowsLocator).all();
        for (const option of rows) {
            await this.assertVisible(option);
        }
    }
    async assertClose() {
        if (this.root) {
            return await this.assertNotVisible(this.locator(this.root));
        }
        return await this.assertNotVisible(this.locator(this.rowsLocator));
    }
    async isOpened() {
        if (this.root) {
            return await this.isVisible(this.root);
        }
        if (this.useTriggerClass) {
            {
                const triggerClass = await this.locator(
                    this.trigger
                ).getAttribute("class");
                if (triggerClass) {
                    return triggerClass.includes("open");
                }
            }
        }
        if (this.useTriggerAriaExpanded) {
            const ariaExpanded = await this.locator(this.trigger).getAttribute(
                "aria-expanded"
            );
            return ariaExpanded === "true";
        }

        const rows = await this.locator(this.rowsLocator).all();
        return rows.length > 0;
    }
    async isClosed() {
        if (this.hideTriggerAfterSelected) {
            return await this.isVisible(this.trigger);
        }
        if (this.root) {
            return !(await this.isVisible(this.root));
        }
    }
    async open(options?: { force?: boolean }) {
        if (await this.isOpened()) {
            logger.debug(`Dropdownlist ${this.trigger} is already opened.`);
            return;
        }
        logger.debug(`Opening dropdownlist ${this.trigger}.`);
        await this.click(this.trigger, { force: options?.force });
    }
    async close() {
        if (!this.isOpened()) {
            logger.debug(`Dropdownlist ${this.trigger} is already closed.`);
            return;
        }
        logger.debug(`Closing dropdownlist ${this.trigger}.`);
        await this.click(this.trigger);
    }
    async closeByClickAround() {
        await this.clickAroundElement(this.locator(this.rowsLocator).nth(0), {
            border: "left",
            offset: 30,
        });
    }
    async clear() {
        if (!this.btnClear) {
            throw new Error("This dropdown list does not have clear button.");
        }
        await this.click(this.locator(this.btnClear));
    }
    async selectByIndex(
        index: number,
        search?: string,
        wait?: number,
        force?: boolean
    ) {
        await this.open();
        await this.sleep(2000);
        if (this.txtSearch && search) {
            await this.search(search);
        }
        await this.waitForTimeout(wait || 1000);
        const matchedCount = await this.locator(this.rowsLocator).count();
        if (index < 1 || index > matchedCount) {
            throw new Error(
                `Index ${index} is out of range. The dropdownlist has ${matchedCount} items.`
            );
        }
        await this.click(this.locator(this.rowsLocator).nth(index - 1), {
            force,
        });
        if (this.btnApply) {
            logger.debug(
                `Clicking apply button in dropdownlist ${this.trigger}.`
            );
            await this.click(this.locator(this.btnApply));
        }
    }
    async selectByText(text: string, options?: ISelect) {
        logger.debug(`Selecting "${text}" from dropdownlist ${this.trigger}.`);
        const resultRequired = options?.resultRequired || true;
        await this.open();
        if (this.txtSearch) {
            await this.fill(
                this.locator(this.txtSearch),
                options?.search || text
            );
        }
        if (options?.sleep) {
            await this.sleep(options.sleep);
        }
        if (resultRequired) {
            await this.waitForSelector(this.rowsLocator, {
                containedText:
                    this.txtSearch && options?.search ? options.search : text,
                state: "visible",
            });
        }
        await this.sleep(options?.renderTime || 1000);
        const rows = await this.locator(this.rowsLocator).all();
        if (rows.length === 0) {
            throw new Error("No row found.");
        }
        for (const row of rows) {
            const rowText = await row.innerText();
            if (
                options?.contained ? rowText.includes(text) : rowText === text
            ) {
                try {
                    logger.debug(`Clicking row with text: ${text}.`);
                    await this.click(row, {
                        timeout: 5000,
                        force: options?.force,
                    });
                    if (this.btnApply) {
                        await this.click(this.locator(this.btnApply));
                    }
                    return;
                } catch (e) {
                    throw new Error(
                        `Cannot click on row ${rows.indexOf(
                            row
                        )} with text: ${text}, \n- Error: ${e}`
                    );
                }
            }
        }
        throw new Error(`Cannot find row with text: ${text}`);
    }

    async selectByDataValue(value: string, options?: ISelect) {
        logger.debug(
            `Selecting data-value "${value}" from dropdownlist ${this.trigger}.`
        );
        const resultRequired = options?.resultRequired ?? true;

        await this.open();

        if (this.txtSearch) {
            await this.fill(
                this.locator(this.txtSearch),
                options?.search || value
            );
        }

        if (options?.sleep) {
            await this.sleep(options.sleep);
        }

        if (resultRequired) {
            await this.waitForSelector(this.rowsLocator, {
                containedText:
                    this.txtSearch && options?.search ? options.search : value,
                state: "visible",
            });
        }

        await this.sleep(options?.renderTime || 1000);

        const rows = await this.locator(this.rowsLocator).all();
        if (rows.length === 0) {
            throw new Error("No row found.");
        }

        for (const row of rows) {
            const rowValue = await row.getAttribute("data-value");
            if (
                options?.contained
                    ? rowValue?.includes(value)
                    : rowValue === value
            ) {
                try {
                    logger.debug(`Clicking row with data-value: ${value}.`);
                    await this.click(row, {
                        timeout: 5000,
                        force: options?.force,
                    });
                    if (this.btnApply) {
                        await this.click(this.locator(this.btnApply));
                    }
                    return;
                } catch (e) {
                    throw new Error(
                        `Cannot click on row ${rows.indexOf(
                            row
                        )} with data-value: ${value}, \n- Error: ${e}`
                    );
                }
            }
        }

        throw new Error(`Cannot find row with data-value: ${value}`);
    }

    async selectByContainingText(text: string) {
        await this.open();
        await this.sleep(2000);
        const rows = await this.locator(this.rowsLocator).all();
        for (const row of rows) {
            const rowText = (await row.textContent()) || "";
            if (rowText.includes(text)) {
                await this.click(row, { force: true });
                break;
            }
        }
        if (this.btnApply) {
            await this.click(this.locator(this.btnApply));
        }
    }
    //add new 0710
    async selectByContainsText(text: string, options?: ISelect) {
        logger.debug(`Selecting "${text}" from dropdownlist ${this.trigger}.`);
        const resultRequired = options?.resultRequired || true;
        await this.open();
        if (this.txtSearch) {
            await this.fill(
                this.locator(this.txtSearch),
                options?.search || text
            );
            // const a = await this.locator(this.txtSearch).inputValue();
            // await this.sleep(3000);
            // await this.fill(this.locator(this.txtSearch), options?.search || a);
        }
        if (options?.sleep) {
            await this.sleep(options.sleep);
        }
        if (resultRequired) {
            await this.waitForSelector(this.rowsLocator, {
                containedText:
                    this.txtSearch && options?.search ? options.search : text,
                state: "visible",
            });
        }
        await this.sleep(options?.renderTime || 1000);
        const rows = await this.locator(this.rowsLocator).all();
        if (rows.length === 0) {
            throw new Error(`No row contains text "${text}".`);
        }
        for (const row of rows) {
            const rowText = (await row.textContent()) || "";
            if (rowText.includes(text)) {
                try {
                    await this.click(row, { timeout: 5000 });
                    break;
                } catch (e) {
                    throw new Error(
                        `Cannot click on row ${rows.indexOf(
                            row
                        )} with text: ${text}, \n- Error: ${e}`
                    );
                }
            }
        }
        if (this.btnApply) {
            await this.click(this.locator(this.btnApply));
        }
    }
    async search(text: string, hold?: number) {
        if (!this.txtSearch) {
            throw new Error("This dropdown list does not have search feature.");
        }
        await this.open();
        await this.fill(this.locator(this.txtSearch), text);
        await this.sleep(hold || 1000);
    }
    async checkByText(_choices: Array<string>, options?: ICheck) {
        const choices = new Set(_choices);
        logger.debug(`Checking by text: ${JSON.stringify(choices)}}`);
        await this.open();
        await this.sleep(options?.sleep);
        await this.waitForSelector(this.rowsLocator, {
            state: "visible",
        });
        const renderTime = options?.renderTime || 1000;
        await this.sleep(process.env.CI ? renderTime * 2 : renderTime);
        if (!this.txtSearch) {
            const rows = await this.locator(this.rowsLocator).all();
            logger.debug(`Dropdown list rows count: ${rows.length}`);
            for (const row of rows) {
                const rowText = await row.innerText();
                logger.trace(`Checking row: ${rowText}`);
                const chkSelector = row.locator("//input[@type='checkbox']");
                if (await chkSelector.isVisible()) {
                    await chkSelector.waitFor({
                        state: "visible",
                    });
                    if (choices.has(rowText)) {
                        if (!(await chkSelector.isChecked())) {
                            await chkSelector.click({
                                force: true,
                            });
                        }
                    } else {
                        if (
                            (await chkSelector.isChecked()) &&
                            (!options?.onlyCheck || !options)
                        ) {
                            await chkSelector.click({
                                force: true,
                            });
                        }
                    }
                }
            }
        } else {
            for (const choice of choices) {
                await this.fill(this.txtSearch, choice);
                await this.waitForSelector(this.rowsLocator, {
                    message: `Cannot find row with text: ${choice}`,
                });
                const rows = await this.locator(this.rowsLocator).all();
                logger.debug(
                    `Dropdown list rows count that match search: ${rows.length}`
                );
                for (const row of rows) {
                    const rowText = await row.innerText();
                    logger.trace(`Checking row: ${rowText}`);
                    const chkSelector = row.locator(
                        "//input[@type='checkbox']"
                    );
                    if (await chkSelector.isEditable()) {
                        await chkSelector.waitFor({
                            state: "visible",
                        });
                        if (choice === rowText) {
                            if (!(await chkSelector.isChecked())) {
                                await chkSelector.click({
                                    force: true,
                                });
                            }
                        } else {
                            if (await chkSelector.isChecked()) {
                                await chkSelector.click({
                                    force: true,
                                });
                            }
                        }
                    }
                }
            }
        }

        if (this.btnApply) {
            await this.click(this.locator(this.btnApply));
        }
    }
    async cancel() {
        if (this.btnCancel) {
            await this.click(this.locator(this.btnCancel));
        }
    }
    async getValues() {
        let inputElement = this.locator(this.trigger);
        if (await inputElement.getAttribute("value")) {
            return await inputElement.inputValue();
        }
        inputElement = this.locator(this.trigger).locator("//input");
        if (await inputElement.getAttribute("value")) {
            return await inputElement.inputValue();
        }
        throw new Error("Cannot get values from dropdownlist.");
    }
    async getCurrentText() {
        return await this.getTextContent(this.trigger);
    }
    async getSelection() {
        return (await this.getCurrentText()) || (await this.getValues());
    }
}
interface ISortOptionsDropdownList extends IDropdownList {
    checkSubLocator?: string | Locator;
    arrowSubLocator?: string | Locator;
    valueSubLocator?: string | Locator;
    labelValue?: string;
    reloadUrl?: string;
    renderTime?: number;
}
type Order = "asc" | "desc";
export type SortOption =
    | {
        by: string;
        order: Order;
    }
    | "None";

export class SortOptionsDropdownList extends DropdownList {
    private checkSubLocator: string | Locator;
    private arrowSubLocator: string | Locator;
    private valueSubLocator: string | Locator;
    private reloadUrl: string | undefined;
    private renderTime: number | undefined;
    private labelValue: string | undefined;
    private sortOptions: string[] = [];
    private rowsWithValues: Array<{ text: string; row: Locator }> = [];
    constructor(page: Page | BaseComponent, options: ISortOptionsDropdownList) {
        super(page, options);
        this.checkSubLocator =
            options.checkSubLocator || "//div[@class='menu-icon'][1]";
        this.valueSubLocator =
            options.valueSubLocator || "//div[@class='menu-label']";
        this.arrowSubLocator =
            options.arrowSubLocator || "//div[@class='menu-icon'][2]/div";
        this.reloadUrl = options.reloadUrl;
        this.renderTime = options.renderTime;
    }
    async getSortOption(): Promise<SortOption> {
        await this.waitForSelector(this.rowsLocator);
        const rows = await this.locator(this.rowsLocator).all();
        logger.debug(`Sort options dropdown list rows count: ${rows.length}`);
        if (this.labelValue) {
            rows.filter(async (row) => {
                const label = await this.getTextContent(row);
                return label !== this.labelValue;
            });
        }
        const pickedRow = await (async () => {
            const results = await Promise.all(
                rows.map(async (row) => {
                    return await this.isVisible(
                        row.locator(this.checkSubLocator).locator("//*")
                    );
                })
            );
            const index = results.findIndex((result) => result);
            return index === -1 ? null : rows[index];
        })();
        if (!pickedRow) {
            return "None";
        }
        logger.debug(
            `Order selected: ${await pickedRow
                .locator(this.arrowSubLocator)
                .getAttribute("class")}`
        );
        const res = {
            by: (await this.getTextContent(pickedRow)) as string,
            order: (
                await pickedRow
                    .locator(this.arrowSubLocator)
                    .getAttribute("class")
            )?.includes("down")
                ? ("desc" as Order)
                : ("asc" as Order),
        };
        return res;
    }
    private async loadSortOptions() {
        if (this.sortOptions.length === 0) {
            const rows = await this.locator(this.rowsLocator).all();
            if (this.labelValue) {
                rows.filter(async (row) => {
                    const label = await this.getTextContent(row);
                    return label !== this.labelValue;
                });
            }
            for (const row of rows) {
                const text = (await this.getTextContent(row)) as string;
                this.sortOptions.push(text);
            }
        }
    }
    private async loadRowsWithValues() {
        if (this.rowsWithValues.length === 0) {
            const rows = await this.locator(this.rowsLocator).all();
            this.rowsWithValues = await Promise.all(
                rows.map(async (row) => {
                    const text = (await this.getTextContent(row)) as string;
                    return {
                        text,
                        row,
                    };
                })
            );
        }
    }
    async waitForReloaded() {
        if (this.reloadUrl) {
            await this.waitForAPILoaded(this.reloadUrl, {
                renderTime: this.renderTime,
            });
        }
    }
    async sortBy(sortOption: SortOption) {
        await this.open({ force: true });
        logger.debug(`Sorting by: ${JSON.stringify(sortOption)}`);
        await this.loadSortOptions();
        await this.loadRowsWithValues();
        const currentSortOption = await this.getSortOption();
        if (deepEqual(sortOption, currentSortOption)) {
            await this.closeByClickAround();
            return;
        }
        if (currentSortOption === "None") {
            if (sortOption === "None") {
                throw new Error(
                    "Logic error: currentSortOption is None and sortOption is None"
                );
            }
            const pickedRow = this.rowsWithValues.find(
                (row) => row.text === sortOption.by
            );
            if (!pickedRow) {
                throw new Error(`Cannot find row with text: ${sortOption.by}`);
            }
            await this.click(pickedRow.row);
            if (sortOption.order === "desc") {
                await this.sleep(1000);
                await this.open({ force: true });
                await this.click(pickedRow.row);
            }
            await this.waitForReloaded();
            return;
        }
        if (currentSortOption.by) {
            if (sortOption === "None") {
                const pickedRow = this.rowsWithValues.find(
                    (row) => row.text === currentSortOption.by
                );
                if (!pickedRow) {
                    throw new Error(
                        `Cannot find row with text: ${currentSortOption.by}`
                    );
                }
                await this.click(pickedRow.row);
                if (currentSortOption.order === "asc") {
                    await this.sleep(1000);
                    await this.open({ force: true });
                    await this.click(pickedRow.row);
                }
                await this.waitForReloaded();
                return;
            }
            if (currentSortOption.by === sortOption.by) {
                const pickedRow = this.rowsWithValues.find(
                    (row) => row.text === sortOption.by
                );
                if (!pickedRow) {
                    throw new Error(
                        `Cannot find row with text: ${sortOption.by}`
                    );
                }
                await this.click(pickedRow.row);
                if (currentSortOption.order === "desc") {
                    await this.sleep(1000);
                    await this.open({ force: true });
                    await this.click(pickedRow.row);
                    return;
                }
                await this.waitForReloaded();
                return;
            }
            if (currentSortOption.by !== sortOption.by) {
                const pickedRow = this.rowsWithValues.find(
                    (row) => row.text === sortOption.by
                );
                if (!pickedRow) {
                    throw new Error(
                        `Cannot find row with text: ${sortOption.by}`
                    );
                }
                await this.click(pickedRow.row);
                if (sortOption.order === "desc") {
                    await this.sleep(1000);
                    await this.open({ force: true });
                    await this.click(pickedRow.row);
                }
                await this.waitForReloaded();
            }
        }
    }
}
export interface IList extends IWidget {
    rowsLocator: string | Locator;
}
export interface IGetList extends IWait {
    subLocator?: string | Locator;
}
interface ISelectByText extends IWait {
    subLocator?: string | Locator;
    subSelectLocator?: string | Locator;
}

/**
 * Represents a list widget. The rowsLocator is the locator that matches all of the rows in the list. If you want to use selectByText, make sure that locator match the text you want to select.
 */
export class List extends Widget {
    protected rowsLocator: string | Locator;
    constructor(page: Page | BaseComponent, options: IList) {
        super(page, options);
        this.rowsLocator = options.rowsLocator;
    }
    /**
     * Selects an item in the list by its text.
     * @param text - The text of the item to select. If text is an array, it will select all items in the array.
     */
    async selectByText(text: string | string[], options?: ISelectByText) {
        logger.debug(`Select by text: ${text}`);
        await this.waitForOptions(options || { sleep: 2000 });
        let rowsLocator = this.root
            ? this.locator(this.root).locator(this.rowsLocator)
            : this.locator(this.rowsLocator);
        rowsLocator = options?.subLocator
            ? rowsLocator.locator(options.subLocator)
            : rowsLocator;
        const rows = await this.locator(rowsLocator).all();
        if (Array.isArray(text)) {
            for (const t of text) {
                await this.selectByText(t);
            }
        } else {
            for (const row of rows) {
                const rowText = await row.innerText();
                if (rowText === text) {
                    await this.click(
                        options?.subSelectLocator
                            ? row.locator(options.subSelectLocator)
                            : row
                    );
                    break;
                }
            }
        }
    }
    /**
     * Selects an item in the list by its index.
     * @param index - The index of the item to select. The index starts from 1.
     * @throws Error if the index is out of range.
     */
    async selectByIndex(index: number, options?: IWait) {
        logger.debug(`Select by index: ${index}`);
        await this.waitForOptions(options || { sleep: 2000 });
        const matchedCount = await this.locator(this.rowsLocator).count();
        logger.debug(`List rows count: ${matchedCount}`);
        if (matchedCount === 0) {
            logger.warn("No list row found.");
            return;
        }
        if (index < 0 || index > matchedCount) {
            throw new Error(
                `Index ${index} is out of range. The dropdownlist has ${matchedCount} items.`
            );
        }
        await this.click(this.locator(this.rowsLocator).nth(index - 1));
    }
    /**
     * Gets the number of rows in the list.
     * @returns The number of rows in the list.
     */
    async getRowsCount(options?: IWait) {
        logger.debug("Getting rows count.");
        await this.waitForOptions(options || { sleep: 1000 });
        const rows = await this.locator(this.rowsLocator).all();
        return rows.length;
    }
    /**
     * Gets the full text of an item in the list by its index.
     * @param index - The index of the item.
     * @returns The full text of the item.
     */
    async getFullTextByIndex(index: number, options: IWait) {
        logger.debug(`Getting full text by index: ${index}`);
        await this.waitForOptions(options || { sleep: 1000 });
        const rows = await this.locator(this.rowsLocator).all();
        const row = rows[index];
        return row.innerText();
    }
    async getListText(options?: IGetList): Promise<Array<string | null>> {
        await this.waitForOptions(options || { sleep: 1000 });
        const rows = await this.locator(this.rowsLocator).all();
        logger.debug(`List rows count: ${rows.length}`);
        const texts = await Promise.all(
            rows.map(async (row) => {
                if (options?.subLocator) {
                    const subElement = row.locator(options.subLocator);
                    return await subElement.textContent();
                }
                return await row.textContent();
            })
        );
        return texts;
    }
    async getRows() {
        return await this.locator(this.rowsLocator).all();
    }
}
export interface ITable extends IWidget {
    root: string | Locator;
    headed?: boolean;
    excludeTexts?: string[];
}
function isLocatorTable(locator: Locator | string): boolean {
    const layers = locator.toString().split("/");
    const lastLayer = layers[layers.length - 1];
    return lastLayer.includes("table");
}

/**
 * Represents a table widget.
 * The root of the table locator must be a table element.
 */
type Group = {
    name: string;
    startSign: string | Locator;
    endSign: string | Locator;
};
const DEFAULT_EXCLUDED_TEXTS = [
    "No results found",
    "No data available",
    "No data",
    "No records",
    "No records found",
    "No items found",
    "End of results",
    "No data to display",
];
/**
 * @deprecated This class is deprecated and will be removed in future versions.
 * Use TableV2 instead.
 */
export class Table extends Widget {
    private grid: Grid = [];
    private gridData: GridData = [];
    private gridComposite: GridComposite = [];
    private columns: string[] = [];
    private cells: Locator[] = [];
    private headed: boolean;
    protected root: string | Locator;
    private static emptySign: string | Locator;
    private groups: Group[] = [];
    private excludedTexts: string[] = [];
    constructor(page: Page | BaseComponent, options: ITable) {
        super(page, options);
        this.root = options.root;
        this.headed = options.headed || false;
        Table.emptySign = this.locator(this.root).locator(
            "//tr//*[contains(text(), 'No results found')]"
        );
        if (!isLocatorTable(this.root)) {
            throw new Error(
                "Root locator must be a table element. Please check the table structure. The last layer of the locator must be 'table'."
            );
        }
        this.excludedTexts = DEFAULT_EXCLUDED_TEXTS.concat(
            options.excludeTexts || []
        );
        logger.debug(
            `Table excluded texts: ${JSON.stringify(this.excludedTexts)}`
        );
    }
    /**
     * Loads all of cells of the table into an array.
     * @param waitTime - Optional. The time to wait before loading the cells. Defaults to 200 milliseconds.
     */

    async isEmpty() {
        return await this.isVisible(Table.emptySign);
    }
    async loadCells(waitTime?: number) {
        this.cells = [];
        this.sleep(waitTime || 200);
        const cells = await this.locator(this.root).locator("//td").all();
        for (const cell of cells) {
            this.cells.push(cell);
        }
    }

    /**
     * Clicks on a cell in the widget that matches the given text.
     * If an index is provided, it clicks on the cell at that index.
     * If no index is provided, it clicks on the first cell that matches the text.
     * Throws an error if no cell is found with the given text.
     * Throws an error if the cell is disabled.
     *
     * @param text - The text to match in the cell.
     * @param index - The index of the cell to click (optional).
     * @throws Error - If no cell is found with the given text or if the cell is disabled.
     */
    async clickCellByText(text: string, index?: number) {
        logger.debug(`Clicking cell with text: ${text}`);
        await this.loadCells();
        const _index = index || 0;
        const cellTexts = await Promise.all(
            this.cells.map((cell) => cell.innerText())
        );
        const matchedCells = this.cells.filter((_, i) => cellTexts[i] === text);
        if (matchedCells.length === 0) {
            throw new Error(`Cannot find cell with text: ${text}`);
        }
        const matchCount = matchedCells.length;
        let cell = matchedCells[_index];
        if (_index > matchCount - 1) {
            cell = matchedCells[matchCount - 1];
            logger.warn(
                `Index ${_index} is out of range. Using the last cell instead.`
            );
        }
        const cellClass = await cell.getAttribute("class");
        if (cellClass?.toLowerCase().includes("disabled")) {
            throw new Error(`Cell with text: ${text} is disabled.`);
        }
        await this.click(cell);
    }

    /**
     * Retrieves a cell element by its text content.
     * @param text - The text content to search for.
     * @returns The cell element that matches the specified text, or `undefined` if not found.
     */
    async getCellByText(text: string) {
        await this.loadCells();
        for (const cell of this.cells) {
            const cellText = await cell.innerText();
            if (cellText === text) {
                return cell;
            }
        }
    }

    /**
     * Loads the columns names of the table.
     * @throws {Error} If the table does not have a head or if the column name is empty.
     * @throws {Error} If no columns are loaded.
     */
    async loadColumns() {
        this.columns = [];
        await this.waitForSelector(
            this.locator(this.root).locator("//thead//tr//th"),
            { state: "visible" }
        );
        const headRow = this.locator(this.root).locator("//thead/tr");
        // await expect(headRow, {
        //     message: `Table ${this.root} has not head, which means can not have columns`,
        // }).toBeAttached();
        await this.waitForTimeout(1000);
        const columnsElements = await headRow.locator("th").all();
        if (columnsElements.length === 0) {
            throw new Error("Table has no columns.");
        }
        for (const column of columnsElements) {
            const text = (await column.textContent()) || "";
            if (text === "") {
                logger.debug(
                    "Column name is empty. Please check the table structure."
                );
            }
            this.columns.push(text);
        }
        if (!this.columns.length) {
            throw new Error("Cannot load columns.");
        }
    }

    /**
     * Retrieves the columns names of the widget.
     * @returns {Promise<Array<string>>} A promise that resolves to an array of column names.
     */
    async getColumns() {
        await this.loadColumns();
        return this.columns;
    }

    /**
     * Loads the grid of element from the UI.
     * @param options - Optional parameters for waiting before loading the grid.
     */
    async loadGrid(options?: IScanTable) {
        logger.debug("Loading grid.");
        await this.loadColumns();
        this.grid = [];
        logger.debug(`Loading grid with columns: ${this.columns}`);
        if (await this.isEmpty()) {
            logger.debug("Table is empty.");
            return;
        }
        const body = this.locator(this.root).locator("//tbody");
        const rows = await body.locator("tr").all();
        await Promise.all(
            rows.map(async (row, index) => {
                if (options?.maxRow) {
                    if (index > options.maxRow) {
                        return;
                    }
                }
                const rowText = (await this.getTextContent(row)) as string;
                if (this.excludedTexts.some((text) => rowText.includes(text))) {
                    logger.debug(`Row excluded: ${rowText}`);
                    return;
                }
                const cells = await row.locator("td").all();
                const rowFields: any = {};
                for (let i = 0; i < this.columns.length; i++) {
                    rowFields[this.columns[i]] = cells[i];
                }
                this.grid.push(rowFields);
            })
        );
    }

    /**
     * Retrieves the grid.
     *
     * @returns The grid of locators.
     */
    async getGrid() {
        await this.loadGrid();
        return this.grid;
    }

    /**
     * Loads the grid data by retrieving the values from the table cells.
     * @param options - Optional parameters for waiting before loading the grid data.
     */
    async loadGridData(options?: IScanTable) {
        logger.debug("Loading grid data.");
        await this.loadColumns();
        this.gridData = [];
        logger.debug(`Loading grid with columns: ${this.columns}`);
        if (await this.isEmpty()) {
            logger.debug("Table is empty.");
            return;
        }
        const body = this.locator(this.root).locator("//tbody");
        const rows = await body.locator("tr").all();
        logger.debug(`Table rows count: ${rows.length}`);
        await Promise.all(
            rows.map(async (row, index) => {
                if (options?.maxRow) {
                    if (index > options.maxRow) {
                        return;
                    }
                }
                const rowText = (await this.getTextContent(row)) as string;
                if (this.excludedTexts.some((text) => rowText.includes(text))) {
                    logger.debug(`Row excluded: ${rowText}`);
                    return;
                }
                const cells = await row.locator("td").all();
                const rowData: any = {};
                for (let i = 0; i < this.columns.length; i++) {
                    try {
                        rowData[this.columns[i]] = await cells[i].textContent();
                    } catch {
                        logger.warn(
                            `Column ${this.columns[i]} from row ${i} has no data.`
                        );
                        rowData[this.columns[i]] = "";
                    }
                }
                this.gridData.push(rowData);
            })
        );
    }

    /**
     * Retrieves the grid data at the specified index.
     * @param index - The index of the grid data to retrieve.
     * @returns The grid data at the specified index.
     */
    async getGridData(options: IScanTable = { reload: true }) {
        if (options?.reload || !this.gridData.length) {
            await this.loadGridData();
        }
        return this.gridData;
    }

    /**
     * Loads the composite grid of the table.
     */
    async loadGridComposite(options?: IScanTable) {
        logger.debug("Loading grid composite.");
        this.gridComposite = [];
        await this.loadGrid(options);
        await this.loadGridData(options);
        if (this.grid.length !== this.gridData.length) {
            logger.debug(
                `Grid: ${JSON.stringify(this.grid)}\nGridData: ${JSON.stringify(
                    this.gridData
                )}`
            );
            throw new Error("Grid and grid should have the same length.");
        }
        logger.trace(`grid: ${JSON.stringify(this.grid)}`);
        logger.trace(`gridData: ${JSON.stringify(this.gridData)}`);
        if (this.grid.length === 0) {
            return;
        }
        if (
            Object.keys(this.grid[0]).length !==
            Object.keys(this.gridData[0]).length
        ) {
            throw new Error(
                "Grid and grid data should have the same number of columns."
            );
        }
        for (let i = 0; i < this.grid.length; i++) {
            const row: IRow = {};
            for (const column of this.columns) {
                const cellComposite = {
                    data: this.gridData[i][column],
                    locator: this.grid[i][column],
                };
                row[column] = cellComposite;
            }
            this.gridComposite.push(row);
        }
        if (options?.additionals) {
            if (options.maxRow) {
                this.gridComposite = this.gridComposite.slice(
                    0,
                    options.maxRow
                );
            }
            for (const additional of options.additionals) {
                await this._loadAdditionalGridComposite(additional);
            }
        }
    }
    private async _loadAdditionalGridComposite(additional: Addtiontional) {
        const promises = this.gridComposite.map(async (row, index) => {
            try {
                const subElement = row[additional.column].locator.locator(
                    additional.subLocator
                );
                const subData =
                    (await subElement.textContent({ timeout: 10000 })) || "";
                row[additional.name] = {
                    data: subData,
                    locator: subElement,
                };
            } catch (e) {
                logger.warn(
                    `Failed to load additional property ${additional.name} grid, row ${index}: ${e}`
                );
            }
        });
        await Promise.all(promises);
    }

    /**
     * Retrieves the grid composite.
     * @param options - Optional parameters for the method.
     * @returns The grid composite.
     */
    async getGridComposite(options?: IScanTable): Promise<GridComposite> {
        if (options?.reload || !this.gridComposite.length) {
            await this.loadGridComposite(options);
        }
        return this.gridComposite;
    }

    /**
     * Loads the content of the widget by calling the necessary methods.
     * This method sequentially loads the columns, grid, and grid data.
     */
    async loadContent() {
        await this.loadColumns();
        await this.loadGrid();
        await this.loadGridData();
        await this.loadGridComposite();
    }

    /**
     * Gets the number of rows in the table.
     * @returns The number of rows in the grid.
     */
    async getRowsCount() {
        this.loadGrid();
        return this.grid.length;
    }

    /**
     * Retrieves the cells of a specific column in the grid.
     * @param column - The name of the column.
     * @param subLocator - Optional sub-locator to further locate the cells within the column.
     * @returns An array of Locator objects representing the cells in the specified column.
     */
    async getColumnCells(column: string, subLocator?: string) {
        await this.loadGrid();
        const columnCells: Locator[] = [];
        for (const row of this.grid) {
            if (subLocator) {
                columnCells.push(row[column].locator(subLocator));
            } else columnCells.push(row[column]);
        }
        return columnCells;
    }

    /**
     * Retrieves the data from a specific column in the widget.
     * @param column - The name of the column to retrieve data from.
     * @param subLocator - Optional sub-locator to narrow down the search for column cells.
     * @returns A promise that resolves to an array of column data.
     */
    async getColumnData(column: string, subLocator?: string) {
        const columnCells = await this.getColumnCells(column, subLocator);
        const columnData = await Promise.all(
            columnCells.map(async (cell, index) => {
                try {
                    return await cell.innerText();
                } catch {
                    logger.warn(`Column ${column} has no data.`);
                }
            })
        );
        return columnData;
    }

    /**
     * Retrieves the row at the specified index from the grid.
     * @param index - The index of the row to retrieve.
     * @returns The row at the specified index.
     */
    async getRow(index: number) {
        this.loadGrid();
        return this.grid[index];
    }

    /**
     * Retrieves the data from a specific cell in the grid.
     *
     * @param row - The row index of the cell.
     * @param column - The column name of the cell.
     * @returns The data in the specified cell.
     */
    async getCellData(row: number, column: string) {
        this.loadGridData();
        return this.gridData[row][column];
    }

    async checkDataSorted(options: ISort) {
        await this.loadGridData();
        await checkSorted(this.gridData, options);
    }
    async isDataSorted(options: ISort) {
        await this.loadGridData();
        return isSorted(this.gridData, options);
    }
    async checkDataRange(options: IRange) {
        await this.loadGridData();
        await checkRange(this.gridData, options);
    }
    async isDataInRange(options: IRange) {
        await this.loadGridData();
        return isInRange(this.gridData, options);
    }
    async waitForAnyRows() {
        await this.waitForSelector(
            this.locator(this.root).locator("//tbody/tr"),
            {
                min: 1,
            }
        );
    }
}
interface ITableV2 extends IWidget {
    root: string | Locator;
    headerRowLocator?: Locator;
    headerCellSubLocator?: Locator;
    bodyRowLocator?: Locator;
    bodyCellSubLocator?: Locator;
    excludedTexts?: ExcludedTexts;
    groupsByText?: GroupsByText;
}
type Cell = {
    locator: Locator;
    text: string | null;
    key: string;
    visible?: boolean;
};
type HeaderCell = {
    locator: Locator | null;
    text: string | null;
    key: string;
};
type RawRow = {
    [key: string]: Cell;
};
export type Row = {
    group?: string; // Explicitly define the "group" key as a string
} & RawRow;
export type Rows = Row[];
type DataRow = {
    [key: string]: string | null;
};
type DataRows = DataRow[];
type InnerCell = {
    subLocator: Locator | string;
    columnName: string;
    key: string;
};
type ExcludedTexts = string[];
type GroupByText = {
    name: string;
    start: string;
    end?: string;
};
type GroupsByText = GroupByText[];
interface IGetTable {
    innerCells?: InnerCell[];
    waitForRows?: boolean;
}
export class TableV2 extends Widget {
    protected root: Locator;
    private headerRowLocator: Locator;
    private headerCellLocator: Locator;
    private bodyRowLocator: Locator;
    private bodyCellSubLocator: Locator;
    private excludedTexts: ExcludedTexts;
    private groupsByText: GroupsByText;
    constructor(page: Page | BaseComponent, options: ITableV2) {
        super(page, options);
        this.root = this.locator(options.root);
        this.headerRowLocator = this.root.locator(
            options.headerRowLocator || "//thead/tr"
        );
        this.headerCellLocator = options.headerCellSubLocator
            ? this.headerRowLocator.locator(options.headerCellSubLocator)
            : this.headerRowLocator.locator("//th");
        this.bodyRowLocator = this.root.locator(
            options.bodyRowLocator || "//tbody/tr"
        );
        this.bodyCellSubLocator =
            options.bodyCellSubLocator || this.locator("xpath=td");
        this.excludedTexts = options.excludedTexts || [];
        this.groupsByText = options.groupsByText || [];
    }
    async getHeaderRow(): Promise<Locator> {
        const headerRows = await this.headerRowLocator.all();
        if (headerRows.length === 0) {
            throw new Error("Header row not found");
        }
        if (headerRows.length > 1) {
            throw new Error("Multiple header rows found");
        }
        return headerRows[0];
    }
    async getHeaderCells(): Promise<HeaderCell[]> {
        const headerCellLocators = await this.headerCellLocator.all();
        const headerCells: HeaderCell[] = [];
        if (headerCellLocators.length === 0) {
            const firstRow = await this.bodyRowLocator.first();
            const columnLength = await firstRow
                .locator(this.bodyCellSubLocator)
                .count();
            for (let i = 0; i < columnLength; i++) {
                const cellLocator = null;
                const cellKey = `column${i}`;
                headerCells.push({
                    locator: cellLocator,
                    text: null,
                    key: cellKey,
                });
            }
            return headerCells;
        }
        for (let i = 0; i < headerCellLocators.length; i++) {
            const cellText = await headerCellLocators[i].textContent();
            const cellKey =
                cellText === null || cellText === "" ? `column${i}` : cellText;
            const cellLocator = headerCellLocators[i];
            headerCells.push({
                locator: cellLocator,
                text: cellText,
                key: cellKey,
            });
        }
        return headerCells;
    }
    async getBody(options?: IGetTable): Promise<Rows> {
        let bodyRows: Rows = [];
        const headerCells = await this.getHeaderCells();
        if (options?.waitForRows) {
            await this.waitForSelector(this.bodyRowLocator, {
                min: 1,
                excludedTexts: this.excludedTexts,
            });
        }
        const rowElements = await this.bodyRowLocator.all();
        const rawRows: Row[] = await Promise.all(
            rowElements.map(async (row, index) => {
                const cells = await row.locator(this.bodyCellSubLocator).all();
                logger.debug(`Row ${index} cells: ${cells.length}`);
                const rowData: Row = {};
                for (let i = 0; i < headerCells.length; i++) {
                    if (!cells[i]) {
                        logger.warn(
                            `Column ${headerCells[i].key} from row ${index} has no data.`
                        );
                        continue;
                    }
                    const cellText = await cells[i].textContent();
                    const cellKey = headerCells[i].key;
                    const cellLocator = cells[i];
                    rowData[cellKey] = {
                        locator: cellLocator,
                        text: cellText,
                        key: cellKey,
                    };
                }
                return rowData;
            })
        );
        bodyRows = rawRows;
        for (const group of this.groupsByText) {
            const groupStartRowIndex = rawRows.findIndex((row) => {
                return Object.keys(row).some((key) => {
                    const cell = row[key];
                    return cell.text?.includes(group.start || "");
                });
            });
            let groupEndRowIndex = rawRows.length - 1;
            if (group.end) {
                groupEndRowIndex = rawRows.findIndex((row) => {
                    return Object.keys(row).some((key) => {
                        const cell = row[key];
                        return cell.text?.includes(group.end || "");
                    });
                });
            }
            logger.debug(
                `Group ${group.name} from ${groupStartRowIndex} to ${groupEndRowIndex}`
            );
            bodyRows = rawRows.map((rawRow, index) => {
                if (index >= groupStartRowIndex && index <= groupEndRowIndex) {
                    const row: Row = rawRow;
                    row.group = group.name;
                    return row;
                }
                return rawRow;
            });
        }
        for (const excludedText of this.excludedTexts) {
            bodyRows = bodyRows.filter((row) => {
                return !Object.keys(row).some((key) => {
                    const cell = row[key];
                    return cell.text?.includes(excludedText);
                });
            });
        }
        const _innerCells = options?.innerCells || [];
        if (options?.innerCells) {
            await Promise.all(
                bodyRows.map(async (row: Row) => {
                    await Promise.all(
                        _innerCells.map(async (innerCell) => {
                            const cell = row[innerCell.columnName];
                            if (cell) {
                                if (!cell.locator) {
                                    logger.warn(
                                        `Cell ${innerCell.columnName} does not have a locator.`
                                    );
                                    return;
                                }
                                const subLocator = cell.locator.locator(
                                    innerCell.subLocator
                                );
                                const isVisible = await this.isVisible(
                                    subLocator
                                );
                                const subText = isVisible
                                    ? await subLocator.textContent()
                                    : null;
                                row[innerCell.key] = {
                                    locator: subLocator,
                                    text: subText,
                                    key: innerCell.key,
                                    visible: isVisible,
                                };
                            }
                        })
                    );
                })
            );
        }
        return bodyRows;
    }
    async getBodyData(options?: IGetTable): Promise<DataRows> {
        const bodyRows = await this.getBody(options);
        const dataRows: DataRows = [];
        for (const row of bodyRows) {
            const dataRow: DataRow = {};
            for (const _key of Object.keys(row)) {
                const cell = row[_key];
                if (cell.text) {
                    dataRow[_key] = cell.text;
                }
            }
            dataRow["group"] = row["group"] as string | null;
            dataRows.push(dataRow);
        }
        return dataRows;
    }
}
/**
 * Represents a checkbox widget that extends the IList interface.
 */
interface ICheckbox extends IList {
    /**
     * The locator for the checkbox element. If not provided, the default locator //input[@type='checkbox'] will be used. If the locator is an empty string, the row locator will be used.
     */
    chkLocator?: string | Locator;
}
/**
 * Represents a Checkbox widget that extends the List class. If you want to use checkByText, make sure that locator match the text you want to check.
 */
export class Checkbox extends List {
    private chkLocator?: string | Locator;
    constructor(page: Page | BasePage, options: ICheckbox) {
        super(page, options);
        this.chkLocator = options.chkLocator;
    }
    /**
     * Checks the checkbox by matching the given text.
     * @param _choices - The text or array of texts to match against.
     * @returns A promise that resolves when the checkbox is checked.
     */
    async checkByText(
        _choices: string | string[],
        options?: ICheck
    ): Promise<void> {
        const choices = new Set(_choices);
        logger.debug(`Checking checkbox by text: ${JSON.stringify(choices)}`);
        const rows = await this.locator(this.rowsLocator).all();
        for (const row of rows) {
            const rowText = (await row.textContent()) as string;
            logger.trace(`Checking row: ${rowText}`);
            const chkSelector =
                this.chkLocator === undefined
                    ? row.locator("//input[@type='checkbox']")
                    : this.chkLocator === ""
                        ? row
                        : row.locator(this.chkLocator);
            if (await chkSelector.isVisible()) {
                await chkSelector.waitFor({
                    state: "visible",
                });
                let isChecked = false;
                try {
                    isChecked = await chkSelector.isChecked();
                } catch (e) {
                    if (
                        e instanceof Error &&
                        (e.message as string).includes(
                            "Not a checkbox or radio button"
                        )
                    ) {
                        const chkProperty =
                            (await chkSelector.getAttribute("class")) || "";
                        isChecked =
                            chkProperty?.includes("checked") ||
                            chkProperty?.includes("selected");
                    }
                }
                if (
                    options?.contained
                        ? Array.from(choices).some((c: string) =>
                            rowText.includes(c)
                        )
                        : choices.has(rowText)
                ) {
                    if (!isChecked) {
                        await chkSelector.click({
                            force: true,
                        });
                    }
                } else {
                    if (isChecked) {
                        await chkSelector.click({
                            force: true,
                        });
                    }
                }
            } else {
                logger.warn(`Checkbox is not visible for row: ${rowText}`);
            }
        }
    }

    /**
     * Checks the checkbox by index.
     * @param index - The index of the checkbox to check.
     * @returns A promise that resolves when the checkbox is checked.
     */
    async checkByIndex(index: number): Promise<void> {
        const options = await this.locator(this.rowsLocator).all();
        await this.click(options[index]);
    }

    /**
     * Asserts that all the given choices are available in the checkbox.
     * @param allChoices - An array of all the choices to check against.
     * @throws An error if the length of allChoices is 0.
     */
    async assertAllChoicesAvailable(allChoices: string[]) {
        if (allChoices.length === 0) {
            logger.warn("All Choices length is 0, which cannot be compared");
        }
        const rows = await this.locator(this.rowsLocator).all();
        const rowTexts = await Promise.all(
            rows.map(async (row) => {
                return await row.innerText();
            })
        );
        this.assertArrayMatches(rowTexts, allChoices);
    }
}
interface IRadio extends IList {
    default?: number | "none";
}
/**
 * Represents a radio buttons group widget that extends the List class.
 */
export class Radio extends List {
    private default?: number | "none";

    /**
     * Constructs a new instance of the Radio class.
     * @param page The Playwright page object.
     * @param options The options for the radio widget.
     */
    constructor(page: Page | BaseComponent, options: IRadio) {
        super(page, options);
        this.default = options.default;
    }

    /**
     * Selects a radio option by its text.
     * @param text The text of the radio option to select.
     * @throws Error if the radio option with the specified text is not found.
     */
    async selectByText(text: string) {
        logger.debug(`Selecting radio by text: ${text}`);
        const rows = await this.locator(this.rowsLocator).all();
        for (const row of rows) {
            const rowText = await row.innerText();
            if (rowText === text) {
                await this.click(row);
                return;
            }
        }
        throw new Error(`Radio with text: "${text}" not found.`);
    }
    async selectByContainingText(
        text: string,
        options?: { caseInsensitive?: boolean; timeout?: number }
    ) {
        logger.debug(`Selecting radio by text: ${text}`);
        const rows = await this.locator(this.rowsLocator).all();
        for (const row of rows) {
            const rowText = options?.caseInsensitive
                ? (await row.textContent())?.toLowerCase()
                : await row.textContent();
            if (
                rowText?.includes(
                    options?.caseInsensitive ? text.toLowerCase() : text
                )
            ) {
                await this.click(row);
                return;
            }
        }
        throw new Error(`Radio: ${text} not found.`);
    }

    async selectByValue(text: string) {
        logger.debug(`Selecting radio has value: ${text}`);
        const rows = await this.locator(this.rowsLocator).all();
        for (const row of rows) {
            const rowText = await row.getAttribute("value");
            if (rowText?.includes(text)) {
                await this.click(row);
                return;
            }
        }
        throw new Error(`Radio: ${text} not found.`);
    }

    /**
     * Selects a radio option by its index.
     * @param index The index of the radio option to select.
     */
    async selectByIndex(index: number) {
        logger.debug(`Selecting radio by index: ${index}`);
        const rows = await this.locator(this.rowsLocator).all();
        await this.click(rows[index]);
    }
}

export interface IDatePickerSetDate extends IWidget {
    fromDate?: string;
    toDate?: string;
}
export interface IDatePicker extends IWidget {
    root: string | Locator;
    trigger: string | Locator;
}

/**
 * Represents a DatePicker widget.
 * @link //
 */
export class DatePicker extends Widget {
    private btnAllTime: string | Locator;
    private btnToday: string | Locator;
    private btnYesterday: string | Locator;
    private btnLast7Days: string | Locator;
    private btnLast30Days: string | Locator;
    private btnThisMonth: string | Locator;
    private btnLastMonth: string | Locator;
    private btnCustom: string | Locator;
    private btnPrevious: string | Locator;
    private btnNext: string | Locator;
    private txtFromDate: string | Locator;
    private txtToDate: string | Locator;
    private btnApply: string | Locator;
    protected root: string | Locator;
    protected trigger: string | Locator;
    private inputRangeDate: string | Locator;

    /**
     * Constructs a new DatePicker instance.
     * @param page The Playwright page object.
     * @param options The options for the DatePicker.
     */
    constructor(page: Page | BaseComponent, options: IDatePicker) {
        super(page, options);
        this.root = options.root;
        this.trigger = options.trigger;
        this.btnAllTime = this.locator(this.root).locator(
            "//div[text()='All Time'][@role='button']"
        );
        this.btnToday = this.locator(this.root).locator(
            "//div[text()='Today'][@role='button']"
        );
        this.btnYesterday = this.locator(this.root).locator(
            "//div[text()='Yesterday'][@role='button']"
        );
        this.btnLast7Days = this.locator(this.root).locator(
            "//div[text()='Last 7 days'][@role='button']"
        );
        this.btnLast30Days = this.locator(this.root).locator(
            "//div[text()='Last 30 days'][@role='button']"
        );
        this.btnThisMonth = this.locator(this.root).locator(
            "//div[text()='This Month'][@role='button']"
        );
        this.btnLastMonth = this.locator(this.root).locator(
            "//div[text()='Last Month'][@role='button']"
        );
        this.btnCustom = this.locator(this.root).locator(
            "//div[text()='Custom'][@role='button']"
        );
        this.btnPrevious = this.locator(this.root).locator(
            "//button[@class='rdrNextPrevButton rdrPprevButton']"
        );
        this.btnNext = this.locator(this.root).locator(
            "//button[@class='rdrNextPrevButton rdrNextButton']"
        );
        this.txtFromDate = this.locator(this.root).locator(
            "//input[@name='startDate']"
        );
        this.txtToDate = this.locator(this.root).locator(
            "//input[@name='endDate']"
        );
        this.btnApply = this.locator(this.root).locator(
            "//button[text()='Apply Filter']"
        );
        this.inputRangeDate = this.locator(
            "//input[@data-testid='input-expiration-date']"
        );
    }

    /**
     * Filters by the default time range.
     * @param range The time range to filter by.
     */
    async filtByDefaultTimeRange(
        range:
            | "All Time"
            | "Today"
            | "Yesterday"
            | "Last 7 days"
            | "Last 30 days"
            | "This Month"
            | "Last Month"
            | "Custom"
    ) {
        switch (range) {
            case "All Time":
                await this.click(this.btnAllTime);
                break;
            case "Today":
                await this.click(this.btnToday);
                break;
            case "Yesterday":
                await this.click(this.btnYesterday);
                break;
            case "Last 7 days":
                await this.click(this.btnLast7Days);
                break;
            case "Last 30 days":
                await this.click(this.btnLast30Days);
                break;
            case "This Month":
                await this.click(this.btnThisMonth);
                break;
            case "Last Month":
                await this.click(this.btnLastMonth);
                break;
            case "Custom":
                await this.click(this.btnCustom);
                break;
            default:
                throw new Error(`Invalid range: ${range}`);
        }
    }

    /**
     * Enters the "from" date in the DatePicker.
     * @param date The "from" date to enter.
     */
    async enterFromDate(date: string) {
        if (!isValidDate(date)) {
            logger.warn(`Invalid date: ${date}`);
        }
        if (date === "") {
            logger.warn("From date is empty.");
            return;
        }
        await this.fill(this.txtFromDate, date);
        await this.keyboard("Enter");
    }

    /**
     * Enters the "to" date in the DatePicker.
     * @param date The "to" date to enter.
     */
    async enterToDate(date: string) {
        if (!isValidDate(date)) {
            logger.warn(`Invalid date: ${date}`);
        }
        if (date === "") {
            logger.warn("To date is empty.");
            return;
        }
        await this.fill(this.txtToDate, date);
        await this.keyboard("Enter");
    }

    /**
     * Enters the "range" date in the DatePicker.
     * @param date The "range" date to enter.
     */
    async enterRangeDate({
        fromDate,
        toDate,
    }: {
        fromDate: string;
        toDate: string;
    }) {
        if (!isValidDate(fromDate)) {
            logger.warn(`Invalid date: ${fromDate}`);
        }
        if (!isValidDate(toDate)) {
            logger.warn(`Invalid date: ${toDate}`);
        }
        if (fromDate === "" || toDate === "") {
            logger.warn("To date is empty.");
            return;
        }
        await this.fill(this.inputRangeDate, `${fromDate} - ${toDate}`);
    }

    /**
     * Gets the current "from" date in the DatePicker.
     * @returns The current "from" date.
     */
    async getFromDate() {
        return await this.getAttribute(this.txtFromDate, "value");
    }

    /**
     * Gets the current "to" date in the DatePicker.
     * @returns The current "to" date.
     */
    async getToDate() {
        return await this.getAttribute(this.txtToDate, "value");
    }

    /**
     * Opens the DatePicker.
     */
    async open() {
        await this.click(this.trigger);
    }

    /**
     * Sets the date in the DatePicker.
     * @param options The options for setting the date.
     */
    async setDate(options: IDatePickerSetDate) {
        this.open();
        if (options.fromDate) {
            await this.enterFromDate(options.fromDate);
        }
        if (options.toDate) {
            await this.enterToDate(options.toDate);
        }
        await this.sleep(200);
        let count = 0;
        do {
            await this.click(this.btnApply);
            count += 1;
            logger.debug(
                `Clicking apply button in DatePicker. Attempt: ${count}`
            );
            await this.sleep(1000);
        } while ((await this.isVisible(this.btnApply)) && count < 5);
        await this.assertNotVisible(this.root);
    }

    /**
     * Sets the date in the DatePicker.
     * @param options The options for setting the date.
     */
    async setDateRange(options: IDatePickerSetDate) {
        if (options.fromDate && options.toDate) {
            await this.enterRangeDate({
                fromDate: options.fromDate,
                toDate: options.toDate,
            });
        }
    }
}
export interface ISimpleDatePicker extends IWidget {
    limitFromPass?: boolean;
    trigger: string | Locator;
    btnClear?: string | Locator;
}

/**
 * Represents a simple date picker widget.
 * @link //
 */
export class SimpleDatePicker extends Widget {
    private limitFromPass: boolean;
    protected trigger: string | Locator;
    private btnClear?: Locator | string;
    private btnNext: Locator;
    private btnPrevious: Locator;
    private lblCurrentTime: Locator;
    private tblYear: Table;
    private tblMonth: Table;
    private tblDay: Table;

    /**
     * Constructs a new instance of the SimpleDatePicker class.
     * @param page The Playwright page object.
     * @param options The options for the SimpleDatePicker.
     */
    constructor(page: Page | BaseComponent, options: ISimpleDatePicker) {
        super(page, options);
        this.trigger = options.trigger;
        this.btnClear = options.btnClear;
        this.limitFromPass = options.limitFromPass || true;
        this.btnPrevious = this.locator("//th[@class='rdtPrev']");
        this.btnNext = this.locator("//th[@class='rdtNext']");
        this.lblCurrentTime = this.locator("//th[@class='rdtSwitch']");
        this.tblYear = new Table(page, {
            root: this.locator("(//div[@class='rdtYears']/table)[2]"),
        });
        this.tblMonth = new Table(page, {
            root: this.locator("(//div[@class='rdtMonths']/table)[2]"),
        });
        this.tblDay = new Table(page, {
            root: this.locator("(//div[@class='rdtDays']/table)[1]"),
        });
    }

    /**
     * Opens the date picker.
     */
    async open() {
        await this.click(this.trigger);
    }
    async clear() {
        if (!this.btnClear) {
            throw new Error("Clear button is not defined.");
        }
        if (await this.getDateStringValue()) {
            await this.click(this.btnClear);
        }
    }
    private async getCurrentTimeString() {
        await this.sleep(200);
        return await this.lblCurrentTime.innerText();
    }

    private async getYearsRange(): Promise<{
        from: number;
        to: number;
    }> {
        await this.sleep(200);
        const currentTime = await this.getCurrentTimeString();
        const regex = /(\d{4}).*?(\d{4})/;
        const match = currentTime.match(regex);

        if (match) {
            const fromYear = Number.parseInt(match[1]);
            const toYear = Number.parseInt(match[2]);
            return { from: fromYear, to: toYear };
        }
        throw new Error("Unable to find years in the current time string");
    }

    private async pickYear(year: number) {
        if (getDateFormat(await this.getCurrentTimeString()) === "month year") {
            await this.click(this.lblCurrentTime);
        }
        if (getDateFormat(await this.getCurrentTimeString()) === "year") {
            if (year === Number.parseInt(await this.getCurrentTimeString())) {
                return;
            }
            await this.click(this.lblCurrentTime);
        }
        let currentYearsRange = await this.getYearsRange();
        while (year < currentYearsRange.from) {
            await this.click(this.btnPrevious);
            await this.sleep(200);
            currentYearsRange = await this.getYearsRange();
        }
        while (year > currentYearsRange.to) {
            await this.click(this.btnNext);
            await this.sleep(200);
            currentYearsRange = await this.getYearsRange();
        }
        await this.tblYear.clickCellByText(year.toString());
    }

    private async pickMonth(month: number) {
        switch (month) {
            case 1:
                await this.tblMonth.clickCellByText("Jan");
                break;
            case 2:
                await this.tblMonth.clickCellByText("Feb");
                break;
            case 3:
                await this.tblMonth.clickCellByText("Mar");
                break;
            case 4:
                await this.tblMonth.clickCellByText("Apr");
                break;
            case 5:
                await this.tblMonth.clickCellByText("May");
                break;
            case 6:
                await this.tblMonth.clickCellByText("Jun");
                break;
            case 7:
                await this.tblMonth.clickCellByText("Jul");
                break;
            case 8:
                await this.tblMonth.clickCellByText("Aug");
                break;
            case 9:
                await this.tblMonth.clickCellByText("Sep");
                break;
            case 10:
                await this.tblMonth.clickCellByText("Oct");
                break;
            case 11:
                await this.tblMonth.clickCellByText("Nov");
                break;
            case 12:
                await this.tblMonth.clickCellByText("Dec");
                break;
            default:
                throw new Error(`Invalid month: ${month}`);
        }
    }

    private async pickDay(day: number) {
        if (day < 1 || day > 31) {
            throw new Error(`Invalid day: ${day}`);
        }
        if (day <= 15) {
            await this.tblDay.clickCellByText(day.toString());
            return;
        }
        await this.tblDay.clickCellByText(day.toString(), 1);
        return;
    }

    /**
     * Picks a specific date in the date picker.
     * @param date The date to pick in the format "MM/DD/YYYY".
     */
    async pickDate(date: string | IDate) {
        const standardDate =
            typeof date === "string"
                ? date
                : convertIDateToDateFormat(date, "MM/DD/YYYY");

        if (!isValidDate(standardDate)) {
            throw new Error(`Invalid date: ${date}`);
        }
        const [month, day, year] = standardDate.split("/");
        await this.open();
        await this.sleep(50);
        await this.pickYear(Number.parseInt(year));
        await this.sleep(50);
        await this.pickMonth(Number.parseInt(month));
        await this.sleep(50);
        await this.pickDay(Number.parseInt(day));
    }
    async setIDate(date: IDate) {
        await this.pickDate(date);
    }
    async getIDateValue(): Promise<IDate | undefined> {
        const triggerClass =
            (await this.getAttribute(this.trigger, "value")) ||
            (await this.getAttribute(
                this.locator(this.trigger).locator("xpath=//input"),
                "value"
            )) ||
            "";
        if (isValidDateString(triggerClass)) {
            return convertDateStringToIDate(triggerClass);
        }
        return undefined;
    }
    async getDateStringValue(
        format = "MM/DD/YYYY"
    ): Promise<string | undefined> {
        const triggerClass = await this.getAttribute(this.trigger, "value");
        if (triggerClass === null) return undefined;
        if (isValidDateString(triggerClass)) {
            const iDateValue = convertDateStringToIDate(triggerClass);
            return convertIDateToDateFormat(iDateValue, format);
        }
        return undefined;
    }
}

/**
 * Represents a widget that collects text.
 */
interface ITextCollector extends IWidget {
    /**
     * The search text
     */
    txtSearch: string | Locator;

    /**
     * The rows locator for the collected text.
     */
    rowsCollector: string | Locator;
}
export class TextCollector extends Widget {
    private rowsCollector: string | Locator;
    private txtSearch: string | Locator;
    constructor(page: Page | BaseComponent, options: ITextCollector) {
        super(page, options);
        this.txtSearch = options.txtSearch;
        this.rowsCollector = options.rowsCollector;
    }
    async getCollection() {
        const collector = await this.locator(this.rowsCollector).all();
        return collector;
    }
    async getCollectionCount() {
        const collector = await this.getCollection();
        return collector.length;
    }
    async getCollectionText() {
        const collector = await this.getCollection();
        const collectorText = await Promise.all(
            collector.map(async (row) => {
                return await row.textContent();
            })
        );
        return collectorText;
    }
    async collect(text: string | string[]) {
        const _text = Array.isArray(text) ? text : [text];
        for (const t of _text) {
            logger.debug(`Collecting text: ${t}`);
            await this.fill(this.txtSearch, t);
            await this.keyboard("Enter");
        }
        const collectorTexts = await this.getCollectionText();
        for (const t of _text) {
            if (!collectorTexts.includes(t)) {
                throw new Error(`Text: ${t} not found in the collection.`);
            }
        }
    }
}
/**
 * Represents a dropdown list collector that extends the IDropdownList interface.
 */
interface IDropdownListCollector extends IDropdownList {
    /**
     * The locator for the rows collector element - collected selections.
     **/
    rowsCollector?: string | Locator;
}
export class DropdownListCollector extends DropdownList {
    private rowsCollector?: string | Locator;
    constructor(page: Page | BaseComponent, options: IDropdownListCollector) {
        super(page, options);
        this.rowsCollector = options.rowsCollector;
    }
    async getCollection() {
        if (!this.rowsCollector) {
            throw new Error("Rows collector locator is not provided.");
        }
        const collector = await this.locator(this.rowsCollector).all();
        return collector;
    }
    async getCollectionCount() {
        const collector = await this.getCollection();
        return collector.length;
    }
    async getCollectionText() {
        const collector = await this.getCollection();
        const collectorText = await Promise.all(
            collector.map(async (row) => {
                return await row.textContent();
            })
        );
        return collectorText;
    }
    async collect(
        texts: string | string[],
        options?: ISelect | undefined
    ): Promise<void> {
        for (const text of texts) {
            const _options = options || { search: text };
            _options.search = text;
            await super.selectByText(text, _options);
        }
        if (!this.rowsCollector) {
            logger.warn(
                "Rows collector locator is not provided. Skip checking collector."
            );
        } else {
            await this.waitForSelectorCount(this.rowsCollector, {
                count: texts.length,
            });
            const collectorTexts = await this.getCollectionText();
            for (const text of texts) {
                if (!collectorTexts.includes(text)) {
                    throw new Error(
                        `Text: ${text} not found in the collection.`
                    );
                }
            }
        }
    }
}

export class BsSingleDatePicker extends Widget {
    protected trigger: string | Locator;
    private btnChangeView: Locator;
    private inputDp: Locator;
    private cellDay: string;
    private cellMonth: string;
    private cellYear: string;
    private dbHeader: Locator;

    /**
     * Constructs a new instance of the SimpleDatePicker class.
     * @param page The Playwright page object.
     * @param options The options for the SimpleDatePicker.
     */
    constructor(page: Page | BaseComponent, options: any) {
        super(page, options);
        this.trigger = options.trigger;

        this.dbHeader = this.locator("//div[@data-testid='bs-dp-header']");
        this.btnChangeView = this.locator(
            "//div[contains(@class, 'MuiPickersCalendarHeader-labelContainer')]"
        );

        this.inputDp = this.locator("//input[@data-testid='bs-dp-input']");

        this.cellDay =
            "div.MuiDayCalendar-weekContainer button:not(.Mui-disabled)";
        this.cellMonth = "div.MuiMonthCalendar-root button:not(.Mui-disabled)";
        this.cellYear = "div.MuiYearCalendar-root button:not(.Mui-disabled)";
    }

    /**
     * Opens the date picker.
     */
    async open() {
        await this.click(this.trigger);
    }

    async getYears() {
        return this.locatorAll(this.cellYear);
    }

    async getMonths() {
        await this.waitForSelector(this.cellMonth, {
            state: "visible",
            timeout: 5000,
        });
        return this.locatorAll(this.cellMonth);
    }

    async getDays() {
        await this.waitForSelector(this.cellDay, {
            state: "visible",
            timeout: 5000,
        });
        return this.locatorAll(this.cellDay);
    }

    async getInputLocator() {
        await this.waitForSelector("input[data-testid='bs-dp-input']", {
            state: "visible",
            timeout: 5000,
        });
        return this.locator("input[data-testid='bs-dp-input']");
    }

    async getCurrentYear(
        yearsLocators: Locator[],
        currentDate: Date
    ): Promise<Locator | undefined> {
        let yearButton = undefined;
        for (const y of yearsLocators) {
            await y.scrollIntoViewIfNeeded();
            await y.waitFor({ state: "visible", timeout: 5000 });
            const t = (await y.textContent()) || "";
            if (t === moment(currentDate).format("YYYY")) {
                yearButton = y;
                break;
            }
        }
        return yearButton;
    }

    async checkInBehavior({
        compareDay,
        compareMonth,
        compareYear,
        format = "MMM DD, YYYY",
    }: {
        compareDay: number;
        compareMonth: number;
        compareYear: number;
        format?: string;
    }) {
        await this.open();

        const currentDate = new Date();

        currentDate.setDate(currentDate.getDate() + compareDay);
        currentDate.setMonth(currentDate.getMonth() + compareMonth);
        currentDate.setFullYear(currentDate.getFullYear() + compareYear);

        const formattedDate = moment(currentDate).format(format);

        await this.assertVisible(this.dbHeader);

        await this.btnChangeView.click();

        const yearsLocators = await this.getYears();

        const yearButton = await this.getCurrentYear(
            yearsLocators,
            currentDate
        );
        yearButton?.click();
        this.sleep(2000);

        const monthLocators = await this.getMonths();

        let tempM = undefined;

        for (const m of monthLocators) {
            const b = await m.textContent();
            if (b === moment(currentDate).format("MMM").toString()) {
                tempM = m;
                break;
            }
        }

        tempM?.click();
        this.sleep(2000);

        const dayLocators = await this.getDays();
        let tempD = undefined;
        for (const d of dayLocators) {
            const b = await d.textContent();
            if (b === moment(currentDate).format("D").toString()) {
                tempD = d;
                break;
            }
        }
        await tempD?.click();

        this.sleep(3000);
        const inputEl = await this.getInputLocator();
        const inputValue = await inputEl.inputValue();

        this.assertEquals(inputValue, formattedDate);
    }

    async setDate({
        compareDay,
        compareMonth,
        compareYear,
        format = "MMM DD, YYYY",
    }: {
        compareDay: number;
        compareMonth: number;
        compareYear: number;
        format?: string;
    }) {
        const currentDate = new Date();
        logger.info(
            `compareDay: ${compareDay}, compareMonth: ${compareMonth}, compareYear: ${compareYear}, format: ${format}`
        );
        currentDate.setDate(currentDate.getDate() + compareDay);
        currentDate.setMonth(currentDate.getMonth() + compareMonth);
        currentDate.setFullYear(currentDate.getFullYear() + compareYear);

        const formattedDate = moment(currentDate).format(format);
        logger.info(`formattedDate: ${formattedDate}`);
        await this.inputDp.click();
        await this.inputDp.press("Control+a");
        await this.inputDp.press("Delete");
        await this.inputDp.pressSequentially(formattedDate, { delay: 400 });
        const inputValue = await this.inputDp.inputValue();
        this.sleep(1000);
        this.assertEquals(inputValue, formattedDate);
    }
}

interface IPickMedia {
    index?: number;
    title?: string;
    alternativeText?: string;
}
export class MediaPicker extends Widget {
    private headerGallery: Locator;
    private lstMedia: List;
    private btnUpload: Locator;
    private btnNext: Locator;
    // Search and Filter
    private txtSearch: Locator;
    private ddlType: DropdownList;
    private dtpUpdatedOn: DatePicker;
    private btnApply: Locator;
    private btnClearAll: Locator;
    // Pick Media
    private infoFileName: Locator;
    private infoFileType: Locator;
    private infoUpdaloadedOn: Locator;
    private infoFileSize: Locator;
    private txtAlternativeText: Locator;
    private txtTitle: Locator;
    private txtCaption: Locator;
    private txtDescription: Locator;
    private txtCopyLink: Locator;
    private txtTags: Locator;
    private btnSave: Locator;
    constructor(page: Page | BaseComponent, options: IWidget) {
        super(page, options);
        this.headerGallery = this.locator("//h6[text()='GALLERY']");
        this.lstMedia = new List(page, {
            rowsLocator: "//div[@id='mediaFileContainer']/div",
        });
        this.btnUpload = this.locator("//button[text()='Upload Files']");
        this.btnNext = this.locator("//button[text()='Next']");

        // Search and Filter
        this.txtSearch = this.locator("//input[@name='search_parameter']");
        this.ddlType = new DropdownList(page, {
            trigger: "//div[@name='content_type']",
            rowsLocator: "...", // Inspect later
        });
        this.dtpUpdatedOn = new DatePicker(page, {
            root: "//div[@data-testid='date-picker-paper']",
            trigger: "//div[@placeholder='Date Uploaded']",
        });
        this.btnApply = this.locator("//button[text()='Apply']");
        this.btnClearAll = this.locator("//button[text()='Clear All']");

        // Pick Media
        this.infoFileName = this.locator(
            "//span[text()='File Name:']/following-sibling::div"
        );
        this.infoFileType = this.locator(
            "//span[text()='File Type:']/following-sibling::span"
        );
        this.infoUpdaloadedOn = this.locator(
            "//span[text()='Uploaded On:']/following-sibling::span"
        );
        this.infoFileSize = this.locator(
            "//span[text()='File Size:']/following-sibling::span"
        );
        this.txtAlternativeText = this.locator(
            "//legend[text()='Alternative Text']/following-sibling::div//input"
        );
        this.txtTitle = this.locator(
            "//legend[text()='Title']/following-sibling::div//input"
        );
        this.txtCaption = this.locator(
            "//legend[text()='Caption']/following-sibling::div//textarea[1]"
        );
        this.txtDescription = this.locator(
            "//legend[text()='Description']/following-sibling::div//textarea[1]"
        );
        this.txtCopyLink = this.locator(
            "//legend[text()='Copy Link']/following-sibling::div//input"
        );
        this.txtTags = this.locator(
            "//legend[text()='Tags']/following-sibling::div//input"
        );
        this.btnSave = this.locator(
            "//h6[text()='GALLERY']/../following-sibling::div//button[text()='Save']"
        );
    }
    async open() {
        if (!this.trigger) {
            throw new Error("Trigger is not provided.");
        }
        await this.click(this.trigger);
    }
    async getMediaCount() {
        return await this.lstMedia.getRowsCount();
    }
    async pickMedia(options?: IPickMedia) {
        if (this.trigger) {
            await this.open();
        }
        let mediaIndex = 0;
        if (options?.index) {
            mediaIndex = options.index;
        } else {
            mediaIndex =
                Math.floor(Math.random() * (await this.getMediaCount())) + 1;
        }
        await this.lstMedia.selectByIndex(mediaIndex);
        await this.click(this.btnNext);
        if (options?.title) {
            await this.fill(this.txtTitle, options.title);
        }
        if (options?.alternativeText) {
            await this.fill(this.txtAlternativeText, options.alternativeText);
        }
        await this.sleep(2000);
        await this.click(this.btnSave);
    }
}
