import fs from "node:fs";
import * as papa from "papaparse";
export function readCSV(filePath: string) {
    const file = fs.readFileSync(filePath);
    const results = papa.parse(file.toString(), { header: true });
    return results.data;
}
