const log4js = require("log4js");
import * as fs from "node:fs";
import type { Logger } from "log4js";
const CONFIG_PATH = "configs/log4js.config.json";
import * as dotenv from "dotenv";
dotenv.config();
export async function clearLog() {
    const content = await fs.readFileSync(CONFIG_PATH, "utf-8");
    // Parse JSON content
    const configs = await JSON.parse(content);
    const log_path = configs.appenders.file.filename;
    await fs.writeFileSync(log_path, "");
}
const CONFIGS = {
    appenders: {
        console: { type: "console" },
        // err: { type: "stderr" },
        // out: { type: "stdout" },
        file: {
            type: "file",
            filename: "logs/test.log",
        },
    },
    categories: {
        default: {
            appenders: ["file", "console"],
            level: process.env.LOG_LEVEL || "all",
        },
    },
    format: {
        format: (logEvent: any) => {
            const stackTrace = new Error().stack;
            logger.info("stackTrace:", stackTrace);
            const modulePath = stackTrace
                ?.split("\n")[3]
                .trim()
                .replace("at ", "");

            return `[${modulePath}] ${
                logEvent.level.levelStr
            } - ${logEvent.data.join(" ")}`;
        },
    },
};
log4js.configure(CONFIGS);
const logger: Logger = log4js.getLogger();
export default logger;
