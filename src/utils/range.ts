import jsonpath from "jsonpath";
import moment from "moment";
import logger from "./logger";
const DEFAULT_TIMEZONE = process.env.TIMEZONE || -5;
export interface IRange {
    from?: number | string;
    to?: number | string;
    type?: "number" | "string" | "date";
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
    path?: string;
    timeZone?: number;
    regex?: RegExp;
}
export function checkRange(_arr: any[], options?: IRange) {
    let arr = _arr;
    let regex = options?.regex;
    if (options?.path) {
        const path = options.path;
        arr = _arr.map((x) => jsonpath.query(x, path)[0]);
    }
    const type = options?.type || "string";
    let format = options?.format;
    if (type === "date") {
        format = options?.format || "MM/DD/YYYY";
        if (!options?.regex) {
            if (format === "DD/MM/YYYY") {
                regex = /(\d{2}\/\d{2}\/\d{4})/;
            }
            if (format === "MM/DD/YYYY") {
                regex = /(\d{2}\/\d{2}\/\d{4})/;
            }
            if (format === "YYYY/MM/DD") {
                regex = /(\d{4}\/\d{2}\/\d{2})/;
            }
            if (format === "YYYY-MM-DD") {
                regex = /(\d{4}-\d{2}-\d{2})/;
            }
            if (format === "DD-MM-YYYY") {
                regex = /(\d{2}-\d{2}-\d{4})/;
            }
            if (format === "MM-DD-YYYY") {
                regex = /(\d{2}-\d{2}-\d{4})/;
            }
            if (format === "YYYY/MM/DD HH:mm:ss") {
                regex = /(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/;
            }
            if (format === "YYYY-MM-DD HH:mm:ss") {
                regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
            }
        }
        arr = arr.map((_x) => {
            let x = _x;
            if (typeof x !== "string") {
                logger.warn(
                    `Checked array member is not a string: ${JSON.stringify(
                        x
                    )}, check the path again, or this will be converted to string automatically!!!`
                );
                x = JSON.stringify(x);
            }
            const match = x.match(regex);
            if (match) {
                return match[1];
            }
            throw new Error(`Invalid date format: ${x}`);
        });
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
    for (let i = 0; i < arr.length; i++) {
        let chosen = arr[i];
        let from = options?.from;
        let to = options?.to;
        if (type === "string") {
            if (format === "case-insensitive") {
                if (from) {
                    from = from.toString().toLowerCase();
                }
                if (to) {
                    to = to.toString().toLowerCase();
                }
            }
            if (from && chosen < from) {
                throw new Error(
                    `arr[${i}] : ${chosen} is less than minimum : ${from}`
                );
            }
            if (to && chosen > to) {
                throw new Error(
                    `arr[${i}] : ${chosen} is greater than maximum : ${to}`
                );
            }
        } else if (type === "date") {
            chosen = moment(chosen, format).valueOf();
            if (from) {
                if (from === "now") {
                    from = moment(
                        moment().utcOffset(
                            options?.timeZone || DEFAULT_TIMEZONE
                        ),
                        format
                    ).valueOf();
                } else {
                    from = moment(from, format).valueOf();
                }
                if (chosen < from) {
                    throw new Error(
                        `arr[${i}] : ${arr[i]} is less than minimum : ${options?.from}`
                    );
                }
            }
            if (to) {
                if (to === "now") {
                    to = moment(
                        moment().utcOffset(
                            options?.timeZone || DEFAULT_TIMEZONE
                        ),
                        format
                    ).valueOf();
                } else {
                    to = moment(to, format).valueOf();
                }
                if (chosen > to) {
                    throw new Error(
                        `arr[${i}] : ${arr[i]} is greater than maximum : ${options?.to}`
                    );
                }
            }
        } else if (type === "number") {
            chosen = Number(chosen);
            if (from) {
                from = Number(from);
            }
            if (to) {
                to = Number(to);
            }
            if (from && chosen < from) {
                throw new Error(
                    `arr[${i}] : ${arr[i]} is less than minimum : ${options?.from}`
                );
            }
            if (to && chosen > to) {
                throw new Error(
                    `arr[${i}] : ${arr[i]} is greater than maximum : ${options?.to}`
                );
            }
        }
    }
}

export function isInRange(arr: any[], options: IRange) {
    try {
        checkRange(arr, options);
        return true;
    } catch (error) {
        logger.info(error);
        return false;
    }
}

export function convertNumberValue(value: string): number | IRange | undefined {
    if (value === "_" || value === "N/A") {
        return undefined;
    }
    if (value.includes("-")) {
        const values = value.split("-");
        if (values.length !== 2) {
            throw new Error(`Invalid range: ${value}`);
        }
        return {
            from: Number(values[0].replace(/[^0-9.-]+/g, "")),
            to: Number(values[1].replace(/[^0-9.-]+/g, "")),
        };
    }
    return Number(value.replace(/[^0-9.-]+/g, ""));
}
