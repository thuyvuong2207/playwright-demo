import { Credentials } from "@nearform/playwright-firebase";
import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
/**
 * See https://playwright.dev/docs/test-configuration.
 */
config();
export default defineConfig<Credentials>({
    testDir: "./tests",
    timeout: 40 * 1000,
    globalSetup: "./tests/global/global-setup.ts",
    globalTeardown: "./tests/global/global-teardown.ts",
    /* Run tests in files in parallel */
    fullyParallel: !!process.env.CI,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 1 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? Number(process.env.WORKERS) : 4,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["json", { outputFile: "playwright-report/results.json" }],
        ["blob", { outputDir: "blob-reports" }],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on",
        screenshot: "on",
        video: {
            mode: process.env.RECORD_VIDEO ? "on" : "off",
        },
        launchOptions: {
            args: ["--allow-file-access-from-files"],
            slowMo: process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 0,
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "wordpress",
            use: { ...devices["Desktop Chrome"] },
            testMatch: /tests\/wp/,
        }
        // {
        //     name: "firefox",
        //     use: { ...devices["Desktop Firefox"] },
        // },

        // {
        //     name: "webkit",
        //     use: { ...devices["Desktop Safari"] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});