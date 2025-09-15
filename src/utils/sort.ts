import jsonpath from "jsonpath";
import moment from "moment";
import logger from "./logger";

/**
 * Represents the order and type of sorting for a collection.
 */
export interface ISort {
    /**
     * The order of sorting. Can be "asc" for ascending or "desc" for descending.
     */
    order?: "asc" | "desc";

    /**
     * The type of data being sorted. Can be "string", "number", or "date".
     */
    type?: "string" | "number" | "date";

    /**
     * The format of the date or string being sorted. Can be one of the following formats:
     * - "DD/MM/YYYY"
     * - "MM/DD/YYYY"
     * - "YYYY/MM/DD"
     * - "YYYY-MM-DD"
     * - "DD-MM-YYYY"
     * - "MM-DD-YYYY"
     * - "YYYY/MM/DD HH:mm:ss"
     * - "YYYY-MM-DD HH:mm:ss"
     * - "case-insensitive"
     * - "case-sensitive"
     */
    format?:
    | "DD/MM/YYYY"
    | "MM/DD/YYYY"
    | "YYYY/MM/DD"
    | "YYYY-MM-DD"
    | "DD-MM-YYYY"
    | "MM-DD-YYYY"
    | "YYYY/MM/DD HH:mm:ss"
    | "YYYY-MM-DD HH:mm:ss"
    | "case-insensitive"
    | "case-sensitive";

    /**
     * The jsonpath to the property being sorted. Demo in: https://jsonpath.com/
     */
    path?: string;
}
export function checkSorted(_arr: any[], options?: ISort) {
    let arr = _arr;
    if (options?.path) {
        const path = options.path;
        arr = _arr.map((x) => jsonpath.query(x, path)[0]);
    }
    const order = options?.order || "asc";
    const type = options?.type || "string";
    let format = options?.format;
    if (type === "date" && format) {
        format = options?.format || "MM/DD/YYYY";
    }
    if (type === "string" && format) {
        format = options?.format || "case-sensitive";
        if (format === "case-insensitive") {
            arr = arr.map((x) => x.toLowerCase());
        } else if (format === "case-sensitive") {
        } else {
            throw new Error("Invalid format");
        }
    }

    for (let i = 0; i < arr.length - 1; i++) {
        if (type === "string") {
            if (order === "asc") {
                if (
                    arr[i].localeCompare(arr[i + 1], "en", {
                        sensitivity: "base",
                    }) > 0
                ) {
                    throw new Error(
                        `arr[${i}] : ${arr[i]} is greater than arr[${i + 1
                        }] : ${arr[i + 1]}`
                    );
                }
            } else {
                if (
                    arr[i].localeCompare(arr[i + 1], "en", {
                        sensitivity: "base",
                    }) < 0
                ) {
                    throw new Error(
                        `arr[${i}] : ${arr[i]} is less than arr[${i + 1}] : ${arr[i + 1]
                        }`
                    );
                }
            }
        } else if (type === "number") {
            if (order === "asc") {
                if (Number(arr[i]) > Number(arr[i + 1])) {
                    throw new Error(
                        `Number(arr[${i}]) : ${Number(
                            arr[i]
                        )} is greater than Number(arr[${i + 1}]) : ${Number(
                            arr[i + 1]
                        )}`
                    );
                }
            } else {
                if (Number(arr[i]) < Number(arr[i + 1])) {
                    throw new Error(
                        `Number(arr[${i}]) : ${Number(
                            arr[i]
                        )} is less than Number(arr[${i + 1}]) : ${Number(
                            arr[i + 1]
                        )}`
                    );
                }
            }
        } else if (type === "date") {
            if (order === "asc") {
                if (
                    moment(arr[i], format).valueOf() >
                    moment(arr[i + 1], format).valueOf()
                ) {
                    throw new Error(
                        `${_arr[i]
                        } - moment(arr[${i}], ${format}).valueOf() : ${moment(
                            arr[i],
                            format
                        ).valueOf()} is greater than ${_arr[i + 1]
                        } moment(arr[${i + 1}], ${format}).valueOf() : ${moment(
                            arr[i + 1],
                            format
                        ).valueOf()}`
                    );
                }
            } else {
                if (
                    moment(arr[i], format).valueOf() <
                    moment(arr[i + 1], format).valueOf()
                ) {
                    throw new Error(
                        `moment(arr[${i}], ${format}).valueOf() : ${moment(
                            arr[i],
                            format
                        ).valueOf()} is less than moment(arr[${i + 1
                        }], ${format}).valueOf() : ${moment(
                            arr[i + 1],
                            format
                        ).valueOf()}`
                    );
                }
            }
        } else {
            throw new Error("Invalid type");
        }
    }
}
export function isSorted(arr: any[], options?: ISort) {
    try {
        checkSorted(arr, options);
    } catch (e) {
        logger.info(e);
        return false;
    }
    return true;
}
