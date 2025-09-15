import logger from "./logger";
import { GridData } from "./type";

export interface IMatch {
	match?: string | RegExp;
	contain?: string;
	notcontain?: string;
	notMatch?: string | RegExp;
	fields?: string[];
	caseSensitive?: boolean;
}
export function checkMatched(arr: GridData, options: IMatch) {
	const optionsArray = [
		options.match,
		options.contain,
		options.notcontain,
		options.notMatch,
	];
	const trueCount = optionsArray.filter(Boolean).length;
	if (trueCount !== 1) {
		throw new Error("Exactly one option is required");
	}
	if (
		options.caseSensitive &&
		(options.match instanceof RegExp || options.notMatch instanceof RegExp)
	) {
		throw new Error("caseSensitive option is not supported with RegExp");
	}
	const fields = options.fields || Object.keys(arr[0]);
	const caseSensitive = options.caseSensitive || false;
	if (!caseSensitive) {
		for (let i = 0; i < arr.length; i++) {
			for (const field of fields) {
				arr[i][field] = arr[i][field].toLowerCase();
			}
		}
		if (options.match) {
			if (typeof options.match === "string") {
				options.match = options.match.toLowerCase();
			}
		}
		if (options.contain) {
			options.contain = options.contain.toLowerCase();
		}
		if (options.notcontain) {
			options.notcontain = options.notcontain.toLowerCase();
		}
		if (options.notMatch) {
			if (typeof options.notMatch === "string") {
				options.notMatch = options.notMatch.toLowerCase();
			}
		}
	}
	logger.info(`arr: ${JSON.stringify(arr)}`);
	if (options.match) {
		const match = options.match;
		for (let i = 0; i < arr.length; i++) {
			const checkedValues = [];
			for (const field of fields) {
				checkedValues.push(arr[i][field]);
			}
			if (typeof match === "string") {
				if (!checkedValues.some((x) => x === match)) {
					throw new Error(
						`No match found for row ${i}: ${JSON.stringify(arr[i])} with field ${JSON.stringify(fields)} matching string ${match}`,
					);
				}
			}
			if (match instanceof RegExp) {
				if (!checkedValues.some((x) => match.test(x))) {
					throw new Error(
						`No match found for row ${i}: ${JSON.stringify(arr[i])} with field ${JSON.stringify(fields)} matching regex ${match}`,
					);
				}
			}
		}
	}
	if (options.contain) {
		const contain = options.contain;
		for (let i = 0; i < arr.length; i++) {
			const checkedValues = [];
			for (const field of fields) {
				checkedValues.push(arr[i][field]);
			}
			if (!checkedValues.some((x) => x.includes(contain))) {
				throw new Error(
					`No match found for row ${i}: ${JSON.stringify(arr[i])} with field ${JSON.stringify(fields)} containing string ${contain}`,
				);
			}
		}
	}
	if (options.notcontain) {
		const notcontain = options.notcontain;
		for (let i = 0; i < arr.length; i++) {
			const checkedValues = [];
			for (const field of fields) {
				checkedValues.push(arr[i][field]);
			}
			if (checkedValues.some((x) => x.includes(notcontain))) {
				throw new Error(
					`Match found for row ${i}: ${JSON.stringify(arr[i])} with field ${JSON.stringify(fields)} containing string ${notcontain}`,
				);
			}
		}
	}
	if (options.notMatch) {
		const notMatch = options.notMatch;
		for (let i = 0; i < arr.length; i++) {
			const checkedValues = [];
			for (const field of fields) {
				checkedValues.push(arr[i][field]);
			}
			if (typeof notMatch === "string") {
				if (checkedValues.some((x) => x === notMatch)) {
					throw new Error(
						`Match found for row ${i}: ${JSON.stringify(arr[i])} with field ${JSON.stringify(fields)} matching string ${notMatch}`,
					);
				}
			}
			if (notMatch instanceof RegExp) {
				if (checkedValues.some((x) => notMatch.test(x))) {
					throw new Error(
						`Match found for row ${i}: ${JSON.stringify(arr[i])} with field ${JSON.stringify(fields)} matching regex ${notMatch}`,
					);
				}
			}
		}
	}
}

export function isMatch(arr: GridData, options: IMatch) {
	try {
		checkMatched(arr, options);
	} catch (e) {
		logger.error(e);
		return false;
	}
	return true;
}
