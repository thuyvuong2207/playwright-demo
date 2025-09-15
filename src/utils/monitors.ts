import { execSync } from "node:child_process";
import * as os from "node:os";
import logger from "./logger";
function isMacOs() {
    return os.platform() === "darwin";
}
function isBrewPackageInstalled(_package: string) {
    if (!isBrewInstalled()) {
        throw new Error("Homebrew is not installed");
    }
    try {
        const output = execSync(`brew list | grep ${_package}`).toString();
        return output.includes(_package);
    } catch {
        return false;
    }
}
function isBrewInstalled() {
    try {
        execSync("brew --version");
        return true;
    } catch {
        return false;
    }
}
function installBrewPackage(_package: string) {
    if (isMacOs()) {
        if (!isBrewInstalled()) {
            throw new Error("Homebrew is not installed");
        }
        if (isBrewPackageInstalled(_package)) {
            return;
        }
        logger.debug(`Installing ${_package}`);
        execSync(`brew install ${_package}`);
    }
}
type ScreenInfo = {
    id: string;
    width: number;
    height: number;
    position: {
        x: number;
        y: number;
    };
    side?: "left" | "right" | "middle";
};
export function getMonitors(): ScreenInfo[] {
    installBrewPackage("displayplacer");
    const output = execSync("displayplacer list").toString();
    const screenInfoStrings = output.split("Persistent screen id:");
    const screenInfos = [];
    for (const screenInfoString of screenInfoStrings) {
        const idMatched = screenInfoString.match(/Contextual screen id: (\d+)/);
        if (!idMatched) {
            continue;
        }
        const id = idMatched[1];
        const resolutionMatched = screenInfoString.match(
            /Resolution: (\d+)x(\d+)/
        );
        if (!resolutionMatched) {
            continue;
        }
        const width = resolutionMatched
            ? Number.parseInt(resolutionMatched[1])
            : 0;
        const height = resolutionMatched
            ? Number.parseInt(resolutionMatched[2])
            : 0;
        const positionMatched = screenInfoString.match(
            /Origin: \(([-\d]+),([-\d]+)\)/
        );
        if (!positionMatched) {
            continue;
        }
        const x = positionMatched ? Number.parseInt(positionMatched[1]) : 0;
        const y = positionMatched ? Number.parseInt(positionMatched[2]) : 0;
        const screenInfo: ScreenInfo = {
            id,
            width,
            height,
            position: {
                x,
                y,
            },
        };
        screenInfos.push(screenInfo);
    }
    const minX = Math.min(...screenInfos.map((s) => s.position.x));
    const maxX = Math.max(...screenInfos.map((s) => s.position.x));
    for (const screenInfo of screenInfos) {
        if (screenInfo.position.x === minX) {
            screenInfo.side = "left";
        } else if (screenInfo.position.x === maxX) {
            screenInfo.side = "right";
        } else {
            screenInfo.side = "middle";
        }
    }
    logger.debug(
        `Available monitors ids: ${screenInfos
            .map((s) => `{id: ${s.id}, side: ${s.side}}`)
            .join(", ")}`
    );
    return screenInfos;
}
export function getMonitor(id: string): ScreenInfo | undefined {
    if (!isMacOs()) {
        console.error("Monitor info is only available on macOS");
        return undefined;
    }
    const monitors = getMonitors();
    return monitors.find((monitor) => monitor.id === id);
}
if (require.main === module) {
    getMonitors();
}
