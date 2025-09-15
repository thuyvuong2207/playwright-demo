import { test as base, chromium } from "@playwright/test";
import { config } from "dotenv";
import BasePage from "src/base/base-page";
import { closeAll, initPage } from "src/base/raw-page";
import Data from "src/utils/collector";
import logger from "src/utils/logger";
import { sleep } from "src/utils/timedate";
config();
// biome-ignore lint/complexity/noBannedTypes: <explanation>
function getParams(func: Function) {
    const funcStr = func.toString().replace(/[/][/].*$/gm, "");
    const match = funcStr.match(/\((.*?)\)/);
    if (match) {
        return match[1].split(",").map((param) => param.trim());
    }
    return [];
}
const MK_ACCOUNTS_FILE = "data/mk/accounts.json";
const MK_AUTO_DATA_TEMPLATE_FILE = "data/mk/auto-data-template.json";
const DL_AUTO_DATA_TEMPLATE_FILE = "data/dl/auto-data-template.json";
const MAILSAC_TOKEN_FILE = "data/third-party/mailsac.json";
const monitorsOrder = (process.env.SCREEN_SET || "")
    .split(",")
    .filter((set) => set !== "");

export const test = base.extend<{
    basePage: BasePage;
    data: any;
    freshPage: BasePage;
    mkAccData: Data;
    autoTemplateData: Data;
    dlAutoTemplateData: Data;
    mailsacTokenData: Data;
    dlAutoAddressData: Data;
    dlAutoAddressWooStoreData: Data;
}>({
    // biome-ignore lint/correctness/noEmptyPattern: <explanation>
    basePage: async ({}, use) => {
        logger.info("Base fixture setup");
        try {
            const options: any = {};
            if (monitorsOrder.length > 0) {
                options.screenId = monitorsOrder[0];
            }
            const page = await initPage(options);
            const basePage = new BasePage(page);
            await use(basePage);
            logger.info("Base fixture teardown");
            await sleep(3000); //must keep in case checkIn, assertionVisible,... run in the end of test, page would be closed before checkIn finish without this line
            await closeAll(page);
        } catch (err) {
            logger.error(err);
        }
    },
    freshPage: async ({ browser }, use) => {
        logger.info("Base fixture setup");
        browser = await chromium.launch({
            headless: process.env.HEADLESS !== "0",
            args: [
                // Use with caution!
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
            devtools: false,
            slowMo: process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 0,
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        const basePage = new BasePage(page, undefined);
        await use(basePage);
        logger.info("Base fixture teardown");
        await basePage.waitForTimeout(3000);
        await page.close();
        await context.close();
        await browser.close();
    },
    mkAccData: new Data(MK_ACCOUNTS_FILE),
    autoTemplateData: new Data(MK_AUTO_DATA_TEMPLATE_FILE),
    dlAutoTemplateData: new Data(DL_AUTO_DATA_TEMPLATE_FILE),
    mailsacTokenData: new Data(MAILSAC_TOKEN_FILE),
    data: {},
});
export function step(stepName?: string) {
    return function decorator(
        // biome-ignore lint/complexity/noBannedTypes: <explanation>
        target: Function,
        context: ClassMethodDecoratorContext
    ) {
        return function replacementMethod(...args: any) {
            let title = `${
                stepName || `${this.constructor.name}.${context.name as string}`
            }`;
            let argsStr = "";
            const argsLength = args.length;
            const argsKeys = getParams(target);
            if (argsLength > 0) {
                argsStr += " with params: ";
                for (let i = 0; i < argsLength; i++) {
                    argsStr += `${argsKeys[i]}: ${JSON.stringify(
                        args[i] || ""
                    ).slice(0, 150)}`;
                    if (i < argsLength - 1) {
                        argsStr += ", ";
                    }
                }
            }
            title += argsStr;
            return test.step(title, async () => {
                // logger.info(`Step: ${title}`);
                return await target.call(this, ...args);
            });
        };
    };
}
