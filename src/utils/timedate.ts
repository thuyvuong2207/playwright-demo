import moment from "moment";
import logger from "./logger";
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const Time23h59m = 23 * HOUR + 59 * MINUTE;
const Time24h = 24 * HOUR;
const CanadaTimezone = -8 * HOUR;
export const WEEK_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
export const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
export type DayOfWeek =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
export type ITime = {
    hours: number;
    minutes: number;
};
export type IDate = {
    day: number;
    month: number;
    year: number;
    weekday?:
        | "Sunday"
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday";
};
export type IDateTime = IDate & ITime;
const AMSignals = ["AM", "am", "a.m", "A.M", "a.m.", "A.M."];
const PMSignals = ["PM", "pm", "p.m", "P.M", "p.m.", "P.M."];
function removeAm(text: string) {
    let result = text;
    for (const signal of AMSignals) {
        result = result.replace(signal, "");
    }
    return result;
}
function removePm(text: string) {
    let result = text;
    for (const signal of PMSignals) {
        result = result.replace(signal, "");
    }
    return result;
}
function isAm(text: string) {
    for (const signal of AMSignals) {
        if (text.includes(signal)) {
            return true;
        }
    }
    return false;
}
function isPm(text: string) {
    for (const signal of PMSignals) {
        if (text.includes(signal)) {
            return true;
        }
    }
    return false;
}
export function getCurrentIDate(options?: { timezone?: number }): IDate {
    let date = new Date();
    const timezone = options?.timezone || CanadaTimezone;
    date = new Date(date.getTime() + timezone);
    return {
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        weekday: WEEK_DAYS[date.getUTCDay()] as IDate["weekday"],
    };
}
export function getCurrentIDateTime(options?: {
    timezone?: number;
}): IDateTime {
    let date = new Date();
    const timezone = options?.timezone || CanadaTimezone;
    date = new Date(date.getTime() + timezone);
    return {
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        weekday: WEEK_DAYS[date.getUTCDay()] as IDate["weekday"],
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
    };
}
export function getRange(from: IDate, to: IDate): IDate[] {
    const range: IDate[] = [];
    let current = from;
    while (compareIDate(current, to) <= 0) {
        range.push(current);
        current = addIDate(current, 1);
    }
    return range;
}
export function addIDate(date: IDate, days: number): IDate {
    const _date = new Date(date.year, date.month - 1, date.day);
    _date.setDate(_date.getDate() + days);
    return {
        day: _date.getDate(),
        month: _date.getMonth() + 1,
        year: _date.getFullYear(),
        weekday: WEEK_DAYS[_date.getDay()] as IDate["weekday"],
    };
}
export function maxIDate(times: Array<IDate>): IDate {
    let max = times[0];
    for (const time of times) {
        if (compareIDate(time, max) > 0) {
            max = time;
        }
    }
    return max;
}
export function subtractIDate(date1: IDate, date2: IDate): number {
    const _date1 = new Date(date1.year, date1.month - 1, date1.day);
    const _date2 = new Date(date2.year, date2.month - 1, date2.day);
    return (_date1.getTime() - _date2.getTime()) / DAY;
}
export function addIDateTimeByMinutes(
    time: IDateTime,
    minutes: number
): IDateTime {
    const date = new Date(
        time.year,
        time.month - 1,
        time.day,
        time.hours,
        time.minutes
    );
    date.setMinutes(date.getMinutes() + minutes);
    return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        weekday: WEEK_DAYS[date.getDay()] as IDate["weekday"],
        hours: date.getHours(),
        minutes: date.getMinutes(),
    };
}
export function subtractIDateTimeInMinutes(
    time1: IDateTime,
    time2: IDateTime
): number {
    const date1 = new Date(
        time1.year,
        time1.month - 1,
        time1.day,
        time1.hours,
        time1.minutes
    );
    const date2 = new Date(
        time2.year,
        time2.month - 1,
        time2.day,
        time2.hours,
        time2.minutes
    );
    return (date1.getTime() - date2.getTime()) / MINUTE;
}
export function subtractITimeInMinutes(time1: ITime, time2: ITime): number {
    const date1 = new Date(0, 0, 0, time1.hours, time1.minutes);
    const date2 = new Date(0, 0, 0, time2.hours, time2.minutes);
    return (date1.getTime() - date2.getTime()) / MINUTE;
}
export function isIDateTimeEqualDate(
    date1: IDateTime | IDate,
    date2: IDateTime | IDate
): boolean {
    return (
        date1.day === date2.day &&
        date1.month === date2.month &&
        date1.year === date2.year
    );
}
export function convertDateStringToIDate(date: string): IDate {
    const _date = new Date(date);
    return {
        day: _date.getDate(),
        month: _date.getMonth() + 1,
        year: _date.getFullYear(),
        weekday: WEEK_DAYS[_date.getDay()] as IDate["weekday"],
    };
}
export function isValidDateString(date: string): boolean {
    return !Number.isNaN(new Date(date).getTime());
}
export function convertIDateToDateString(date: IDate): string {
    return `${MONTH_NAMES[date.month - 1]} ${date.day}, ${date.year}`;
}
/**
 * Compares two IDate objects and returns a value indicating their relative order.
 * @param date1 The first IDate object to compare.
 * @param date2 The second IDate object to compare.
 * @returns A number indicating the relative order of the two dates:
 * - 1 if date1 is greater than date2
 * - 0 if date1 is equal to date2
 * - -1 if date1 is less than date2
 */
export function compareIDate(date1: IDate, date2: IDate): 1 | 0 | -1 {
    if (date1.year > date2.year) {
        return 1;
    }
    if (date1.year < date2.year) {
        return -1;
    }
    if (date1.month > date2.month) {
        return 1;
    }
    if (date1.month < date2.month) {
        return -1;
    }
    if (date1.day > date2.day) {
        return 1;
    }
    if (date1.day < date2.day) {
        return -1;
    }
    return 0;
}
export function compareIDateTime(
    date1: IDateTime,
    date2: IDateTime
): 1 | 0 | -1 {
    if (date1.year > date2.year) {
        return 1;
    }
    if (date1.year < date2.year) {
        return -1;
    }
    if (date1.month > date2.month) {
        return 1;
    }
    if (date1.month < date2.month) {
        return -1;
    }
    if (date1.day > date2.day) {
        return 1;
    }
    if (date1.day < date2.day) {
        return -1;
    }
    if (date1.hours > date2.hours) {
        return 1;
    }
    if (date1.hours < date2.hours) {
        return -1;
    }
    if (date1.minutes > date2.minutes) {
        return 1;
    }
    if (date1.minutes < date2.minutes) {
        return -1;
    }
    return 0;
}
export function convert12HoursTimeToITime(time: string): ITime {
    if (isPm(time)) {
        const timeWithoutPm = removePm(time);
        const [hourStr, minuteStr] = timeWithoutPm.split(":");
        let hours = Number.parseInt(hourStr.trim(), 10) + 12;
        if (hours === 24) {
            hours = 12;
        }
        const minutes = Number.parseInt(minuteStr.trim(), 10);
        return { hours, minutes };
    }
    if (isAm(time)) {
        const timeWithoutAm = removeAm(time);
        const [hourStr, minuteStr] = timeWithoutAm.split(":");
        let hours = Number.parseInt(hourStr.trim(), 10);
        if (hours === 12) {
            hours = 0;
        }
        const minutes = Number.parseInt(minuteStr.trim(), 10);
        return { hours, minutes };
    }
    {
        const [hourStr, minuteStr] = time.split(":");
        const hours = Number.parseInt(hourStr.trim(), 10);
        const minutes = Number.parseInt(minuteStr.trim(), 10);
        return { hours, minutes };
    }
}
export function convertITimeTo12HoursTime(
    time: ITime,
    options?: {
        periods?: { am: string; pm: string };
        pad?: { hours?: boolean; minutes?: boolean };
    }
): string {
    let { hours, minutes } = time;
    const { periods, pad } = options || {};
    const period =
        hours >= 12
            ? periods
                ? periods.pm
                : "p.m"
            : periods
            ? periods.am
            : "a.m";
    if (hours > 12) {
        hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }
    let formattedHours = hours.toString();
    let formattedMinutes = minutes.toString();
    if (pad?.hours) {
        formattedHours = formattedHours.padStart(2, "0");
    }
    if (pad?.minutes) {
        formattedMinutes = formattedMinutes.padStart(2, "0");
    }
    return `${formattedHours}:${formattedMinutes} ${period}`;
}
export function turnITimeToAM(time: ITime): ITime {
    let { hours, minutes } = time;
    if (hours >= 12) {
        hours -= 12;
    }
    return { hours: hours, minutes: minutes };
}
export function turnITimeToPM(time: ITime): ITime {
    let { hours, minutes } = time;
    if (hours < 12) {
        hours += 12;
    }
    return { hours: hours, minutes: minutes };
}

function convertITimeToMinutes(time: ITime) {
    return time.hours * 60 + time.minutes;
}
export type Slot = {
    from: ITime;
    to: ITime;
};
export type IDateSlot = {
    iDate: IDate;
    slots: Slot[];
};
type TimeSlot = {
    slots: Slot[];
    count: number;
    start?: ITime;
    end?: ITime;
};
export function calculateTimeslot(
    startTime?: ITime,
    endTime?: ITime,
    duration?: number,
    nextAvailableTime?: number
): TimeSlot {
    if (!startTime || !endTime || !duration || !nextAvailableTime) {
        return {
            slots: [],
            count: 0,
        };
    }
    const startTimeInMinutes = convertITimeToMinutes(startTime);
    let endTimeInMinutes = convertITimeToMinutes(endTime);
    if (endTimeInMinutes === Time23h59m / MINUTE) {
        endTimeInMinutes += 1;
    }
    let currentSlotStarting = startTimeInMinutes;
    let nextSlotEnding = currentSlotStarting + duration;
    let count = 0;
    let start: number | undefined;
    let end: number | undefined;
    const slots: Slot[] = [];
    while (nextSlotEnding <= endTimeInMinutes) {
        currentSlotStarting = nextSlotEnding - duration;
        const startHour = Math.floor(currentSlotStarting / 60);
        const startMinute = currentSlotStarting % 60;
        const endHour = Math.floor(nextSlotEnding / 60);
        const endMinute = nextSlotEnding % 60;
        const slot: Slot = {
            from: { hours: startHour, minutes: startMinute },
            to: { hours: endHour, minutes: endMinute },
        };
        if (slot.to.hours === 24 && slot.to.minutes === 0) {
            slot.to.hours = 23;
            slot.to.minutes = 59;
        }
        slots.push(slot);
        start = startTimeInMinutes;
        end = nextSlotEnding;
        if (end === Time24h / MINUTE) {
            end -= 1;
        }
        nextSlotEnding += nextAvailableTime;
        count++;
    }
    return {
        slots,
        count,
        start:
            start !== undefined
                ? {
                      hours: Math.floor(start / 60),
                      minutes: start % 60,
                  }
                : start,
        end:
            end !== undefined
                ? {
                      hours: Math.floor(end / 60),
                      minutes: end % 60,
                  }
                : end,
    };
}

// Sleep Utils
export async function sleep(time: number) {
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

// Normal Time and Date Utils
export function getCurrentTimeDateString(): string {
    return new Date().toISOString().replace(/[^0-9]/g, "");
}
export function isValidDate(date: string, format = "MM/DD/YYYY"): boolean {
    return moment(date, format, true).isValid();
}
export function convertIDateToDateFormat(
    date: IDate,
    format = "MM/DD/YYYY"
): string {
    return moment(
        `${date.month}/${date.day}/${date.year}`,
        "MM/DD/YYYY"
    ).format(format);
}

export function getDateFormat(
    date: string
):
    | "year-range"
    | "year"
    | "month year"
    | "month-range"
    | "day-range"
    | "invalid" {
    const yearRangeRegex = /^\d{4}-\d{4}$/;
    const yearRegex = /^\d{4}$/;
    const monthRangeRegex =
        /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/;
    if (yearRangeRegex.test(date)) {
        return "year-range";
    }
    if (yearRegex.test(date)) {
        return "year";
    }
    if (monthRangeRegex.test(date)) {
        return "month year";
    }
    return "invalid";
}

/**
 * Returns the formatted date based on the given offset to current time and format.
 * @param offset - The number of days to offset from the current date.
 * @param format - The desired format of the date. Defaults to "MM/DD/YYYY".
 * @returns The formatted date string.
 */
export function getDate(
    offset: number,
    format:
        | "DD/MM/YYYY"
        | "MM/DD/YYYY"
        | "YYYY/MM/DD"
        | "DD-MM-YYYY"
        | "MM-DD-YYYY"
        | "YYYY-MM-DD" = "MM/DD/YYYY"
): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return moment(date).format(format);
}

export function getCurrentDateWithFormat(format: string): string {
    return moment(new Date().getTime()).format(format);
}
