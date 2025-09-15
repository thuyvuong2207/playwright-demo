import fs from "node:fs";
import path from "node:path";
import humps from "humps";
import ts from "typescript";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import logger from "./logger";
function writeFileSyncRecursive(filePath: string, data: any) {
	// Create directory path
	const directoryPath = path.dirname(filePath);
	fs.mkdirSync(directoryPath, { recursive: true });

	// Write file
	fs.writeFileSync(filePath, data);
}
async function writeToFileWithUniqueName(_filePath: string, data: any) {
	let filePath = _filePath;
	const dir = path.dirname(filePath);
	const ext = path.extname(filePath);
	const base = path.basename(filePath, ext);
	let index = 0;

	const argv = await yargs(hideBin(process.argv)).argv;
	const doReplace = argv.r || argv.replace;
	while (fs.existsSync(filePath)) {
		if (doReplace) {
			logger.debug(`Replacing file: ${filePath}`);
			fs.unlinkSync(filePath);
			break;
		}
		filePath = path.join(dir, `${base}_${index}${ext}`);
		index++;
	}
	logger.debug(`Writing to file: ${filePath}`);
	writeFileSyncRecursive(filePath, data);
}

function getClassProperties(classDeclaration: ts.ClassDeclaration): {
	fields: { name: string; initialValue: string | undefined }[];
	methods: string[];
} {
	const fields: { name: string; initialValue: string | undefined }[] = [];
	const methods: string[] = [];

	for (const member of classDeclaration.members) {
		if (ts.isPropertyDeclaration(member)) {
			const memberName = member.name?.getText();
			const initialValue = member.initializer?.getText();
			if (memberName) {
				fields.push({ name: memberName, initialValue });
			}
		} else if (ts.isMethodDeclaration(member)) {
			const memberName = member.name?.getText();
			if (memberName) {
				methods.push(memberName);
			}
		}
	}
	return { fields, methods };
}
function processTypeScriptFile(filePath: string) {
	const sourceFile = ts.createSourceFile(
		path.basename(filePath),
		fs.readFileSync(filePath, "utf8"),
		ts.ScriptTarget.ES2015,
		true,
	);

	const classes: {
		name: string;
		fields: { name: string; initialValue: string | undefined }[];
		methods: string[];
	}[] = [];

	const visitor = (node: ts.Node): void => {
		if (ts.isClassDeclaration(node)) {
			const { name } = node;
			const { fields, methods } = getClassProperties(node);

			classes.push({ name: name?.getText() || "Anonymous", fields, methods });
		}
		ts.forEachChild(node, visitor);
	};

	ts.forEachChild(sourceFile, visitor);

	return classes;
}
function generateUIContentFromCodeFile(filePath: string) {
	const classes = processTypeScriptFile(filePath);
	console.log(JSON.stringify(classes, null, 2));
	const uiFile = classes
		.map((cls) => {
			return `export const ${humps.decamelize(cls.name, { separator: "_" }).toUpperCase()}_UI = {\n\t${cls.fields.map((field) => `${field.name} : ${field.initialValue || ""}`).join(",\n\t")}\n}`;
		})
		.join("\n\n");
	return uiFile;
}
function generateUIFileFromCodeFile(filePath: string) {
	const uiContent = generateUIContentFromCodeFile(filePath);
	const uiFilePath = filePath
		.replace(/src\/pom\/pages/, "src/pom/ui")
		.replace(/\-page.ts$/, "-ui.ts");
	writeToFileWithUniqueName(uiFilePath, uiContent);
}
async function main() {
	const argv = await yargs(hideBin(process.argv)).argv;
	const files = argv._;
	for (const file of files) {
		generateUIFileFromCodeFile(file.toString());
	}
}

function generatePropertiesFromUIObject(object: Object) {
	const properties = Object.entries(object).map(([key, value]) => {
		return `private ${key}: Locator = this.locator(UI.${key});`;
	}).join("\n");
	return `export const UI_PROPERTIES = {\n${properties}\n}`;
}
if (require.main === module) {
	try {
		const generated = generatePropertiesFromUIObject({
			// Variations & Specs - Inventory
			headInventory: "//span[text()='Inventory']",
			tblInventory: "//span[text()='Inventory']/following-sibling::div[1]/div",
		})
		logger.info("Generated UI properties:\n", generated);
	} catch (error) {
		logger.error("Error generating UI files:", error);
		process.exit(1);
	}
}
