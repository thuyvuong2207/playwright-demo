import type { Page } from "@playwright/test";
import { BaseURL } from "configs/url";
import { config } from "dotenv";
import BaseComponent, { IWait } from "src/base/base-component";
import { IRoleProfile } from "src/types/profile";
import logger from "src/utils/logger";
config();

type Request = {
    url: string;
    method: string;
};

/**
 * Represents a base page component.
 * This class is used to create a new page, including Home, Login, Register, Dashboard, etc.
 * The BasePage class extends the BaseComponent class and adds page-specific fields like url, actions around navigation, and API collection.
 */
export default class BasePage extends BaseComponent {
    protected _url!: string;
    protected _requests: Request[] = [];
    public BS_URL: string;
    public data: any;
    constructor(page: Page | BasePage, options?: IRoleProfile) {
        super(page, options);
        if (process.env.ENV === "dev") {
            this.BS_URL = process.env.BS_DEV_URL || BaseURL.DEV_URL;
        } else {
            this.BS_URL = process.env.BS_INT_URL || BaseURL.PROD_URL;
        }
    }

    // Browser status
    async isPageClosed() {
        return this.getPage().isClosed();
    }

    // Actions

    /**
     * Navigates to the current page URL and takes a screenshot.
     *
     * @return {Promise<void>} A promise that resolves when the navigation and screenshot are complete.
     */
    async selfNavigate() {
        try {
            logger.info(`Self navigating to: ${this._url}`);
            if (this.getCurrentUrl() !== this._url) {
                await this.getPage().goto(this._url);
                // await this.screenshotAndAttach(
                //     `Self navigate to: ${this._url}`,
                //     {
                //         state: "domcontentloaded",
                //         sleep: 2000,
                //     }
                // );
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Reloads the current page.
     *
     * @return {Promise<void>} A promise that resolves when the page is successfully reloaded.
     */
    async reload() {
        try {
            await this.getPage().reload();
        } catch (err) {
            logger.error(err);
        }
    }
    async backward() {
        try {
            await this.getPage().goBack();
        } catch (err) {
            logger.error(err);
        }
    }
    async forward() {
        try {
            await this.getPage().goForward();
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Navigates to the specified URL.
     * @param {string} url - The URL to navigate to.
     */
    async goto(url: string) {
        try {
            logger.info(`Navigating to: ${url}`);
            await this.getPage()?.goto(url);
        } catch (err) {
            logger.error(err);
        }
    }

    // Get information

    /**
     * Returns the current URL of the page.
     * @returns {Promise<string>} - The current URL.
     */

    getCurrentUrl(): string {
        if (!this.getPage()) {
            throw new Error("Page is not initialized");
        }
        try {
            return this.getPage().url();
        } catch (err) {
            logger.error(err);
            throw new Error("Failed to get current URL");
        }
    }

    /**
     * Retrieves the URL of the page.
     * @returns A promise that resolves to the URL of the page.
     */
    async getUrl(): Promise<string> {
        return this._url;
    }

    /**
     * Retrieves the title of the current page.
     * @returns A promise that resolves to a string representing the title of the page.
     */
    async getTitle(): Promise<string> {
        return this.getPage().title();
    }

    /**
     * Starts collecting API requests that match the specified URL query.
     *
     * @param {string | RegExp} [urlQuery] - The URL query to match API requests against. If not provided, matches all requests.
     * @return {Promise<void>} - A promise that resolves when the API collection is started.
     */
    async startCollectAPI(urlQuery?: string | RegExp) {
        logger.info("Collecting API");
        try {
            this._requests = [];
            const _urlQuery = urlQuery || "**/*";
            this.getPage().route(_urlQuery, (route, request) => {
                const collectedRequest: Request = {
                    url: request.url(),
                    method: request.method(),
                };
                this._requests.push(collectedRequest);
                route.continue();
            });
        } catch (err) {
            logger.error(err);
        }
    }
    /**
     * Retrieves the collected API requests.
     *
     * @return {Promise<Array<Object>>} An array of collected API requests.
     */
    async getCollectedAPI() {
        return this._requests;
    }

    /**
     * Takes a screenshot and attaches it to the test report.
     * @param title - The title of the screenshot.
     * @param options - Optional parameters for customizing the screenshot behavior.
     */
    async screenshotAndAttach(title: string, options?: IWait) {
        try {
            logger.info(`Taking screenshot and attaching: ${title} after...`);
            if (process.env.CAPTURE === "1") {
                await this.waitForOptions(options || { sleep: 3000 });
                await this.screenshot();
            }
        } catch (err) {
            logger.error(err);
        }
    }

    /**
     * Takes a screenshot and attaches it to the test report with the specified title.
     * @param title - The title of the screenshot.
     */
    async flash(title: string) {
        await this.screenshotAndAttach(title, { sleep: 0 });
    }

    async recordVideo() {
        return await this.getPage().video()?.path();
    }

    async startRecordAudio(timeout: number, path: string) {
        // this.getPage().evaluate(
        //     (timeout: any, path: any) => {
        //         const mediaRecorder = new MediaRecorder(window.stream);
        //         const chunks = [];
        //         mediaRecorder.ondataavailable = (event) => {
        //             chunks.push(event.data);
        //         };
        //         mediaRecorder.onstop = () => {
        //             const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        //             const url = URL.createObjectURL(blob);
        //             const a = document.createElement("a");
        //             document.body.appendChild(a);
        //             a.style = "display: none";
        //             a.href = url;
        //             a.download = path;
        //             a.click();
        //             window.stream.getTracks().forEach((track) => track.stop());
        //         };
        //         mediaRecorder.start();
        //         setTimeout(() => {
        //             mediaRecorder.stop();
        //         }, timeout);
        //     },
        //     timeout,
        //     path
        // )
    }

    /**
     * Clears all cookies for the current page.
     */
    async clearCookies() {
        await this.getPage().context().clearCookies();
    }
    async getAccessTokenFromIndexedDB() {
        const _accessToken = await this.getPage().evaluate(() => {
            return new Promise<string>((resolve, reject) => {
                function fetchData(db: any) {
                    const transaction = db.transaction(
                        "firebaseLocalStorage",
                        "readonly"
                    );
                    const store = transaction.objectStore(
                        "firebaseLocalStorage",
                        {
                            keyPath: "fbase_key",
                        }
                    );
                    const request = store.getAll();
                    request.onsuccess = function (event: any) {
                        const data = event.target.result;
                        const accessToken =
                            data[0].value.stsTokenManager.accessToken;
                        console.log(accessToken);
                        resolve(accessToken);
                    };
                    request.onerror = function (event: any) {
                        reject(event.target.error);
                    };
                }

                const indexedDB = window.indexedDB;
                const request = indexedDB.open("firebaseLocalStorageDb", 1);
                request.onsuccess = function (event: any) {
                    const db = event.target.result;
                    fetchData(db);
                };
                request.onerror = function (event: any) {
                    reject(event.target.error);
                };
            });
        });

        return _accessToken;
    }
    async setAccessTokenToIndexedDB(accessToken: string) {
        await this.getPage().evaluate((accessToken) => {
            return new Promise<void>((resolve, reject) => {
                function fetchData(db: any) {
                    const transaction = db.transaction(
                        "firebaseLocalStorage",
                        "readwrite"
                    );
                    const store = transaction.objectStore(
                        "firebaseLocalStorage",
                        {
                            keyPath: "fbase_key",
                        }
                    );
                    const request = store.getAll();
                    request.onsuccess = function (event: any) {
                        const data = event.target.result;
                        data[0].value.stsTokenManager.accessToken = accessToken;
                        const updateRequest = store.put(data[0]);
                        updateRequest.onsuccess = function () {
                            resolve();
                        };
                        updateRequest.onerror = function (event: any) {
                            reject(event.target.error);
                        };
                    };
                    request.onerror = function (event: any) {
                        reject(event.target.error);
                    };
                }

                const indexedDB = window.indexedDB;
                const request = indexedDB.open("firebaseLocalStorageDb", 1);
                request.onsuccess = function (event: any) {
                    const db = event.target.result;
                    fetchData(db);
                };
                request.onerror = function (event: any) {
                    reject(event.target.error);
                };
            });
        }, accessToken);
        logger.info("Set access token to indexedDB");
    }
    async storeState() {
        this.getContext().storageState({
            path: "./state.json",
            indexedDB: true,
        });
    }
    async newPage() {
        return await this.getContext().newPage();
    }
}
