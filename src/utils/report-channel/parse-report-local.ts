import fs from "node:fs";
import * as sgMail from "@sendgrid/mail";
import { WebClient } from "@slack/web-api";
import logger from "src/utils/logger";
require("dotenv").config();
console.log(`Parse report script is running - ${process.env.PROJECT}`);

const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const JSON_REPORT_PATH = "playwright-report/results.json";
const SLACK_ALL_MEMBERS_PATH = "configs/members.json";
const REPORTED_SLACK_MEMBERS = process.env.REPORTED_SLACK_MEMBERS;

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
function getReportSummary(reportPath: string): string {
	const { total, passed, failed, flaky, skipped } =
		getReportResults(reportPath);
	return `Total: ${total}, Passed: ${passed}, Failed: ${failed}, Flaky: ${flaky}, Skipped: ${skipped}`;
}

async function getLaunchURL(): Promise<string> {
	const publicUrl = "";

	return publicUrl;
}

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
function getMembersIdsMsg(): string {
	let msg = "";
	const allMembers = JSON.parse(
		fs.readFileSync(SLACK_ALL_MEMBERS_PATH, "utf-8"),
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
async function sendSlackMessage(report_url: string): Promise<void> {
	const token = process.env.SLACK_TOKEN;
	const web = new WebClient(token);
	const summary = getReportSummary(JSON_REPORT_PATH);
	const results = getReportResults(JSON_REPORT_PATH);
	const isFailed = results.failed > 0;
	console.log("Summary: ", summary);
	let msg = `New test report ${report_url}\n${summary}`;
	if (isFailed) {
		msg = `${getMembersIdsMsg()}\n${msg}`;
	}
	try {
		if (!SLACK_CHANNEL_ID) throw new Error("SLACK_CHANNEL_ID is not defined");
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
		`Parsing and sending report to channel: ${SLACK_CHANNEL_ID?.slice(0, 6) || "undefined"}`,
	);
	if (process.env.ENV !== "int") return;
	try {
		const report_url = await getLaunchURL();
		// await sendEmail(report_url);
		await sendSlackMessage(report_url);
	} catch (err) {
		console.error(err);
		process.exitCode = 1;
	}
}

main();
