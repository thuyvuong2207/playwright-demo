import { Browser, BrowserContext, Page } from "@playwright/test";
import { config } from "dotenv";
import { chromium } from "playwright";
import logger from "src/utils/logger";
import { getMonitor, getMonitors } from "src/utils/monitors";
config();
const DEFAULT_BROWSER_ARGS = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--allow-file-access-from-files",
];
const monitorsOrder = (process.env.MONITORS_ORDER || "")
    .split(",")
    .filter((set) => set !== "");
logger.debug(`Monitors order: ${JSON.stringify(monitorsOrder)}`);
const monitorsBrowser: { [key: string]: number } = {};
// Create a global variable to hold the page instance
interface IPage {
    fromBrowser?: Browser;
    fromContext?: BrowserContext;
    screenId?: string;
}
function getMonitorsDistribution(): string {
    if (Object.keys(monitorsBrowser).length === 0) {
        const availableMonitors = getMonitors();
        logger.debug(
            `Available monitors: ${JSON.stringify(availableMonitors)}`
        );
        for (const monitor of monitorsOrder) {
            if (
                availableMonitors.find(
                    (availableMonitor) => availableMonitor.id === monitor
                )
            ) {
                monitorsBrowser[monitor] = 0;
            } else {
                logger.error(`Monitor ${monitor} not found`);
            }
        }
    }
    const minBrowserCount = Math.min(...Object.values(monitorsBrowser));
    const minBrowserKey =
        Object.keys(monitorsBrowser).find(
            (key) => monitorsBrowser[key] === minBrowserCount
        ) || "1";
    monitorsBrowser[minBrowserKey]++;
    logger.info(`Monitors distribution: ${JSON.stringify(monitorsBrowser)}`);
    return minBrowserKey;
}
async function setScreenSize(page: Page) {
    if (process.env.SCREEN_SIZE) {
        if (process.env.SCREEN_SIZE.includes("x")) {
            const size = process.env.SCREEN_SIZE.split("x");
            await page.setViewportSize({
                width: Number.parseInt(size[0]),
                height: Number.parseInt(size[1]),
            });
        }
    } else {
        await page.setViewportSize({
            width: 1366,
            height: 768,
        });
    }
}
export async function initPage(options?: IPage): Promise<Page> {
    logger.info("Init new page");
    if ((options?.fromBrowser || options?.fromContext) && options?.screenId) {
        throw new Error("Cannot use fromBrowser or fromContext with screenId");
    }
    const args = DEFAULT_BROWSER_ARGS;
    if (options?.fromBrowser) {
        const context = await options.fromBrowser.newContext();
        const page = await context.newPage();
        await setScreenSize(page);
        return page;
    }
    if (options?.fromContext) {
        const page = await options.fromContext.newPage();
        await setScreenSize(page);
        return page;
    }
    if (monitorsOrder.length > 0) {
        const monitor = getMonitor(getMonitorsDistribution());
        if (monitor) {
            const position = monitor.position;
            args.push(`--window-position=${position?.x},${position?.y}`);
        } else {
            logger.error("Monitor not found");
        }
    }
    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== "0",
        args,
        devtools: false,
        slowMo: process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 0,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await setScreenSize(page);
    return page;
}
export async function closePage(page: Page) {
    await page.close();
}

export async function closeContext(page: Page) {
    await page.close();
    if (page.context().pages().length === 0) {
        await page.context().close();
    }
}
export async function closeAll(page: Page) {
    const context = page.context();
    const browser = context.browser();
    await page.close();
    if (context.pages().length === 0) {
        await context.close();
    }
    if (browser?.contexts().length === 0) {
        await browser.close();
    }
}
