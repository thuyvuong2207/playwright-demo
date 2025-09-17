import jp from "jsonpath";
import * as fs from "node:fs";
import logger from "src/utils/logger";
interface UserDataQueryOptions {
	username?: string;
	tag?: string;
	workspace?: string;
}
export function readData(path: string) {
	try {
		const data = fs.readFileSync(path, "utf8");
		const dataJson = JSON.parse(data);
		return dataJson;
	} catch (e) {
		logger.error(`Error in readData from ${path} : ${e}`);
	}
}
export function getData(filepath: string, jsonpath: string) {
	try {
		const data = readData(filepath);
		return jp.query(data, jsonpath);
	} catch (e) {
		logger.error(`Error in getData with query ${jsonpath} : ${e}`);
	}
}
export async function setData(filepath: string, jsonpath: string, value: any) {
	try {
		const data = readData(filepath);
		jp.value(data, jsonpath, value);
		fs.writeFileSync(filepath, JSON.stringify(data));
	} catch (e) {
		logger.error(
			`Error in setData to value ${value} with query ${jsonpath} : ${e}`,
		);
	}
}

export default class Data {
	private _path: string;
	private _data: any;
	constructor(path: string) {
		this._path = path;
		this._data = readData(this._path);
	}

	/**
	 * Gets the data stored in the collector.
	 * @returns The data stored in the collector.
	 */
	data() {
		return this._data;
	}
	/**
	 * Queries all data from the specified JSON path.
	 * @param jsonpath - The JSON path to query.
	 * @returns An array containing the queried data.
	 */
	queryAllData(jsonpath: string): any[] {
		try {
			return jp.query(this._data, jsonpath);
		} catch (e) {
			logger.error(`Error in queryAllData with query ${jsonpath} : ${e}`);
			throw e;
		}
	}

	/**
	 * Retrieves the first matched data from the given JSON path.
	 *
	 * @param jsonpath - The JSON path to query.
	 * @returns The first matched data.
	 */
	queryFirstMatchedData(jsonpath: string): any {
		try {
			return jp.query(this._data, jsonpath)[0];
		} catch (e) {
			logger.error(
				`Error in queryFirstMatchedData with query ${jsonpath} : ${e}`,
			);
			throw e;
		}
	}

	/**
	 * Sets the value of the first matched JSON path in the data object and writes the updated data to a file.
	 * @param jsonpath - The JSON path to match.
	 * @param value - The value to set.
	 */
	setFirstMatchedData(jsonpath: string, value: any) {
		try {
			jp.value(this._data, jsonpath, value);
			fs.writeFileSync(this._path, JSON.stringify(this._data, null, 4));
		} catch (e) {
			logger.error(
				`Error in setFirstMatchedData with query ${jsonpath} : ${e}`,
			);
			throw e;
		}
	}
	getUserData(options: UserDataQueryOptions) {
		try {
			if (options.username) {
				return this.queryFirstMatchedData(
					`$..[?(@.username == '${options.username}')]`,
				);
			}
			if (options.tag) {
				return this.queryFirstMatchedData(`$..[?(@.tag == '${options.tag}')]`);
			}
		} catch (e) {
			logger.error(`Error in getUserData with options ${options} : ${e}`);
			throw e;
		}
	}
}
export function getMarketingData() {
	return new Data("data/mk/data.json").data();
}
export function getDeliveryData() {
	return new Data("data/dl/auto-data-template.json").data();
}

export function getServiceData() {
	return new Data("data/sv/data.json").data();
}
