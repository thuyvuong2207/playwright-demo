import fs from "fs-extra";
import { clearLog } from "src/utils/logger";
const CLEARED_FOLDERS = ["reports", "playwright-report", "results"];
const authFile = "./tests/global/auth.json";

export default async function globalSetup() {
    await clearLog();
    for (const folder of CLEARED_FOLDERS) {
        try {
            await fs.remove(folder); // Cross-platform directory removal
        } catch (error) {
            console.error(`Failed to remove folder ${folder}:`, error);
        }
    }
    console.log("Global setup completed.");
}
// setup('authen', async ({page}) => {})
