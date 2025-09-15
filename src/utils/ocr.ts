import tesseract from "node-tesseract-ocr";

const config = {
	lang: "eng",
	oem: 1,
	psm: 3,
};
export async function ocr(imagePath: string | Buffer): Promise<string> {
	try {
		const text = await tesseract.recognize(imagePath, config);
		return text;
	} catch (err) {
		throw new Error(`Error in OCR: ${err}`);
	}
}
if (require.main === module) {
	(async () => {
		try {
			const result = await ocr(".vscode/image1.png");
			console.log("OCR Result:", result);
		} catch (err) {
			console.error(err);
		}
	})();
}