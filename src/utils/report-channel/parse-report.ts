import { Storage } from "@google-cloud/storage";
import * as sgMail from "@sendgrid/mail";
import { WebClient } from "@slack/web-api";
import fs from "node:fs";
import path from "node:path";
import logger from "src/utils/logger";
require("dotenv").config();
console.log(`Parse report script is running - ${process.env.PROJECT}`);

const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const JSON_REPORT_PATH = "playwright-report/results.json";
const SLACK_ALL_MEMBERS_PATH = "configs/members.json";
const REPORTED_SLACK_MEMBERS = process.env.REPORTED_SLACK_MEMBERS;
const bucketName = "int-qa-automation-test";
const dataSource = "playwright-report/data";
const fileSource = "playwright-report/index.html";

interface TestResult {
    status: string;
}

interface Test {
    results: TestResult[];
}

interface Spec {
    tests: Test[];
}

interface Suite {
    specs: Spec[];
}

/**
 * Parses the report from the specified JSON file and calculates the results.
 *
 * @param reportPath - The path to the JSON report file.
 * @returns An object containing the total number of tests, and counts of passed, failed, flaky, and skipped tests.
 *          Returns undefined if an error occurs during parsing.
 */
function getReportResults(reportPath: string): any {
    try {
        let total = 0;
        let passed = 0;
        let failed = 0;
        let flaky = 0;
        let skipped = 0;
        const jsonReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
        if (jsonReport.stats) {
            passed = jsonReport.stats.expected;
            failed = jsonReport.stats.unexpected;
            flaky = jsonReport.stats.flaky;
            skipped = jsonReport.stats.skipped;
            total = passed + failed + flaky + skipped;
        }
        return { total, passed, failed, flaky, skipped };
    } catch (err) {
        console.error(err);
    }
}

/**
 * Generates a summary of the test report results.
 *
 * @param reportPath - The path to the report file from which to extract results.
 * @returns A string summarizing the total, passed, failed, flaky, and skipped tests.
 */
function getReportSummary(reportPath: string): string {
    const { total, passed, failed, flaky, skipped } =
        getReportResults(reportPath);
    return `Total: ${total}, Passed: ${passed}, Failed: ${failed}, Flaky: ${flaky}, Skipped: ${skipped}`;
}

/**
 * Uploads a file to Google Cloud Storage and makes it publicly accessible.
 * 
 * This function creates a unique directory based on the current timestamp,
 * uploads an index.html file and any additional data files from a specified
 * source directory to that unique directory in the specified bucket.
 * 
 * @returns {Promise<string>} A promise that resolves to the public URL of the uploaded index.html file.
 * 
 * @throws {Error} Throws an error if the upload fails or if there are issues with file access.
 */
async function uploadFile(): Promise<string> {
    const now = new Date().toISOString();
    const destination = `bs-ui/${now}/`;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}index.html`;
    try {
        const storage = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            credentials: {
                client_email: process.env.GCP_CLIENT_EMAIL,
                private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
        });
        const bucket = storage.bucket(bucketName);
        await bucket.upload(fileSource, {
            destination: `${destination}index.html`,
        });
        // Make the file public
        const fileInBucket = bucket.file(`${destination}index.html`);
        await fileInBucket.makePublic();
        try {
            const files = fs.readdirSync(dataSource);
            for (const file of files) {
                const localFilePath = path.join(dataSource, file);
                const stats = fs.statSync(localFilePath);

                if (stats.isFile()) {
                    const destPath = path.join(`${destination}data`, file);
                    await bucket.upload(localFilePath, {
                        destination: destPath,
                    });
                    const newFile = bucket.file(destPath);
                    await newFile.makePublic();
                }
            }
        }
        catch (err) {
            console.error("Error uploading data files:", `${err}\n---------------------`);
        }

        console.log(`Report is available at ${publicUrl}`);
    } catch (err) {
        console.log(err);
    }
    return publicUrl;
}

/**
 * Sends an email with a report URL using SendGrid.
 *
 * @param report_url - The URL of the report to be included in the email.
 * @returns A promise that resolves when the email has been sent.
 *
 * @remarks
 * This function will not send an email if the SENDGRID_API_KEY environment variable is not set.
 * It logs the sending process and any errors that occur during the email sending.
 */
async function sendEmail(report_url: string): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) return;
    logger.info(`Sending email with report:${report_url}`);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set the SendGrid API key
    try {
        const to = [""];
        const from = "";
        const email = {
            to,
            from,
            subject: "Report",
            text: "Automation UI Email Report",
            html: `<p>Report is available at <a href="${report_url}">${report_url}</a></p>`,
        };

        await sgMail.send(email);
        console.log("Email sent.");
    } catch (err) {
        console.error(err);
    }
}

/**
 * Retrieves a message containing the Slack user IDs of reported members.
 * 
 * This function reads a JSON file containing all Slack members and compares
 * it against a list of reported Slack members. It constructs a message that
 * mentions each matched member by their user ID in the format `<@user_id>`.
 * If a reported member is not found in the list of all members, a message
 * will be logged to the console.
 * 
 * @returns {string} A string containing mentions of the matched Slack user IDs,
 *                   or an empty string if no matches are found.
 */
function getMembersIdsMsg(): string {
    let msg = "";
    const allMembers = JSON.parse(
        fs.readFileSync(SLACK_ALL_MEMBERS_PATH, "utf-8")
    ).members;
    const reportedSlackMembers = REPORTED_SLACK_MEMBERS?.split(",") || [];
    const matchedIds = [];
    for (const member of reportedSlackMembers) {
        if (allMembers[member]) {
            matchedIds.push(allMembers[member]);
        } else {
            console.log("Member not found: ", member);
        }
    }
    if (matchedIds.length > 0) {
        for (const id of matchedIds) {
            msg = `${msg}<@${id}> `;
        }
        msg = `${msg}\n`;
    }

    return msg;
}

/**
 * Sends a message to a specified Slack channel with the UI test report summary.
 *
 * @param report_url - The URL of the UI test report to be included in the message.
 * @returns A promise that resolves when the message has been sent.
 * 
 * @throws Will throw an error if SLACK_CHANNEL_ID is not defined or if there is an issue sending the message.
 */
async function sendSlackMessage(report_url: string): Promise<void> {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    const summary = getReportSummary(JSON_REPORT_PATH);
    const results = getReportResults(JSON_REPORT_PATH);
    const isFailed = results.failed > 0;
    console.log("Summary: ", summary);
    let msg = `UI test report ${report_url}\n${summary}`;
    if (isFailed) {
        msg = `${getMembersIdsMsg()}\n${msg}`;
    }
    try {
        if (!SLACK_CHANNEL_ID)
            throw new Error("SLACK_CHANNEL_ID is not defined");
        const res = await web.chat.postMessage({
            channel: SLACK_CHANNEL_ID,
            text: msg,
        });

        console.log("Message response status: ", res.ok);
    } catch (err) {
        console.error(err);
    }
}

export async function main(): Promise<void> {
    console.log(
        `Parsing and sending report to channel: ${SLACK_CHANNEL_ID?.slice(0, 6) || "undefined"
        }`
    );
    if (process.env.ENV !== "int") return;
    try {
        const report_url = await uploadFile();
        // await sendEmail(report_url);
        await sendSlackMessage(report_url);
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
}

main();
