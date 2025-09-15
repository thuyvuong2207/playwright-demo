import { Locator } from "@playwright/test";

/**
 * Represents a range of values.
 */
export interface Range {
    /**
     * The starting value of the range.
     */
    from?: string | number;

    /**
     * The ending value of the range.
     */
    to?: string | number;
}

/**
 * Represents a time range.
 */
export interface TimeRange {
    from?: string;
    to?: string;
}

/**
 * Represents an array of objects where each object has string key-value pairs.
 */
export type GridData = Array<{
    [key: string]: string;
}>;

/**
 * Represents a grid of cells.
 */
export type Grid = Array<Cell>;

/**
 * Represents a cell object.
 * @typedef {Object} Cell
 * @property {Locator} key - The key of the cell.
 * @property {Locator} value - The value of the cell.
 */
export type Cell = {
    [key: string]: Locator;
};

/**
 * Represents a grid composite.
 * @typedef {Array<Composite>} GridComposite
 */
export type GridComposite = Array<Composite>;

/**
 * Represents a composite object that maps keys to an object with data and locator properties.
 */
export type Composite = {
    [key: string]: {
        data: string;
        locator: Locator;
    };
};

/**
 * Represents a table scan configuration.
 */
export interface IScanTable {
    /**
     * Specifies whether the table should be reloaded.
     */
    reload?: boolean;

    /**
     * Specifies whether the table should be scrolled.
     */
    scroll?: boolean;

    /**
     * Additional information for the scan table.
     */
    additionals?: Addtiontional[];
    maxRow?: number;
}

/**
 * Represents additional information for a specific field of the table.
 */
export type Addtiontional = {
    name: string;
    column: string;
    subLocator: string;
};
