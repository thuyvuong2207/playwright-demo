import { expect } from "@playwright/test";
import { ISort, checkSorted } from "./sort";
// Asserts for single value

/**
 * Asserts that the actual value is equal to the expected value.
 * Throws an error with a custom message if the values are not equal.
 *
 * @param actual - The actual value to compare.
 * @param expected - The expected value to compare against.
 */
interface IAssertOptions {
	message?: string;
}
export function assertEquals(
	actual: any,
	expected: any,
	options?: IAssertOptions,
) {
	expect(actual, {
		message: options?.message || `Expected ${expected}, but got ${actual}`,
	}).toEqual(expected);
}

/**
 * Asserts that the actual value is not equal to the expected value.
 *
 * @param actual - The actual value to be compared.
 * @param expected - The expected value to be compared against.
 */
export function assertNotEquals(
	actual: any,
	expected: any,
	options?: IAssertOptions,
) {
	expect(actual, {
		message:
			options?.message ||
			`Expected not to equal ${expected}, but got ${actual}`,
	}).not.toEqual(expected);
}

/**
 * Asserts that the actual value is greater than the expected value.
 *
 * @param actual - The actual value to be compared.
 * @param expected - The expected value to compare against.
 */
export function assertGreater(
	actual: number,
	expected: number,
	options?: IAssertOptions,
) {
	expect(actual, {
		message:
			options?.message ||
			`Expected greater than ${expected}, but got ${actual}`,
	}).toBeGreaterThan(expected);
}

/**
 * Asserts that the actual value is greater than or equal to the expected value.
 *
 * @param actual - The actual value to be compared.
 * @param expected - The expected value to compare against.
 */
export function assertGreaterOrEqual(actual: number, expected: number) {
	expect(actual, {
		message: `Expected greater than or equal to ${expected}, but got ${actual}`,
	}).toBeGreaterThanOrEqual(expected);
}

/**
 * Asserts that the actual value is less than the expected value.
 *
 * @param actual - The actual value to compare.
 * @param expected - The expected value to compare against.
 */
export function assertLess(
	actual: number,
	expected: number,
	options?: IAssertOptions,
) {
	expect(actual, {
		message:
			options?.message || `Expected less than ${expected}, but got ${actual}`,
	}).toBeLessThan(expected);
}

/**
 * Asserts that the actual value is less than or equal to the expected value.
 *
 * @param actual - The actual value to be compared.
 * @param expected - The expected value to compare against.
 */
export function assertLessOrEqual(
	actual: number,
	expected: number,
	options?: IAssertOptions,
) {
	expect(actual, {
		message:
			options?.message ||
			`Expected less than or equal to ${expected}, but got ${actual}`,
	}).toBeLessThanOrEqual(expected);
}

/**
 * Asserts that the given value is true.
 * @param actual - The value to be checked.
 */
export function assertTrue(actual: any, options?: IAssertOptions) {
	expect(actual, {
		message: options?.message || `Expected true, but got ${actual}`,
	}).toBeTruthy();
}

/**
 * Asserts that the given value is false.
 *
 * @param actual - The value to be checked.
 */
export function assertFalse(actual: boolean, options?: IAssertOptions) {
	expect(actual, {
		message: options?.message || `Expected false, but got ${actual}`,
	}).toBeFalsy();
}

/**
 * Asserts that the given value is null.
 *
 * @param actual - The value to be checked.
 */
export function assertNull(actual: any, options?: IAssertOptions) {
	expect(actual, {
		message: options?.message || `Expected null, but got ${actual}`,
	}).toBeNull();
}

/**
 * Asserts that the given value is not null.
 * Throws an error if the value is null.
 *
 * @param actual - The value to be checked.
 */
export function assertNotNull(actual: any, options?: IAssertOptions) {
	expect(actual, {
		message: options?.message || `Expected not null, but got ${actual}`,
	}).not.toBeNull();
}

/**
 * Asserts that the given value is undefined.
 *
 * @param actual - The value to be checked.
 */
export function assertUndefined(actual: any, options?: IAssertOptions) {
	expect(actual, {
		message: options?.message || `Expected undefined, but got ${actual}`,
	}).toBeUndefined();
}

/**
 * Asserts that the given value is not undefined.
 * @param actual - The value to be checked.
 */
export function assertNotUndefined(actual: any, options?: IAssertOptions) {
	expect(actual, {
		message: options?.message || `Expected not undefined, but got ${actual}`,
	}).not.toBeUndefined();
}

/**
 * Asserts that the given actual string is equal to the expected string.
 *
 * @param {string} actual - The actual string to compare.
 * @param {string} expected - The expected string to compare against.
 * @return {Promise<void>} - A promise that resolves when the assertion is successful.
 * @throws {Error} - If the actual string is not equal to the expected string.
 */
export function assertStringContains(
	actual: string,
	expected: string,
	options?: IAssertOptions,
) {
	expect(actual, {
		message:
			options?.message ||
			`Expected string to contain "${expected}", but got "${actual}"`,
	}).toContain(expected);
}

/**
 * Asserts that a string does not contain the expected substring.
 *
 * @param actual - The actual string to check.
 * @param expected - The expected substring that should not be present in the actual string.
 */
export function assertStringNotContains(
	actual: string,
	expected: string,
	options?: IAssertOptions,
) {
	expect(actual, {
		message:
			options?.message ||
			`Expected string not to contain "${expected}", but got "${actual}"`,
	}).not.toContain(expected);
}

// Asserts for array
/**
 * Asserts that two arrays match each other.
 *
 * @param actual - The actual array.
 * @param expected - The expected array.
 */
export function assertArrayMatches(
	actual: Array<any>,
	expected: Array<any>,
	options?: IAssertOptions,
) {
	assertArrayContains(actual, expected, options);
	assertArrayContains(expected, actual, options);
}

/**
 * Asserts that the actual array contains all the elements from the expected array.
 *
 * @param actual - The actual array to be checked.
 * @param expected - The expected array containing the elements to be checked against.
 */
export function assertArrayContains(
	actual: Array<any>,
	expected: Array<any>,
	options?: IAssertOptions,
) {
	const isTrue = actual.every((value) => expected.includes(value));
	expect(isTrue, {
		message:
			options?.message ||
			`Expected array to contain all elements from ${expected}, but got ${actual}`,
	}).toBeTruthy();
}

/**
 * Asserts that an array is sorted according to the specified options.
 *
 * @param arr - The array to be checked.
 * @param options - The options specifying the sorting order.
 */
export function assertSorted(arr: any[], options: ISort) {
	checkSorted(arr, options);
}

/**
 * Asserts that the given array is sorted in ascending order.
 *
 * @param {any[]} arr - The array to be checked for ascending order.
 * @return {Promise<void>} - A promise that resolves when the assertion is successful.
 * @throws {Error} - If the array is not sorted in ascending order.
 * @deprecated - Use assertSorted instead.
 */
export function assertAscendingOrder(arr: any[], options?: ISort) {
	expect(arr, {
		message: `Expected array to be sorted in ascending order, but got ${arr}`,
	}).toEqual(expect.arrayContaining(arr.sort()));
}

/**
 * Asserts that the given array is sorted in descending order.
 *
 * @param {any[]} arr - The array to be checked for descending order.
 * @return {Promise<void>} - A promise that resolves when the assertion is successful.
 * @throws {Error} - If the array is not sorted in descending order.
 * @deprecated - Use assertSorted instead.
 */
export function assertDescendingOrder(arr: any[]) {
	expect(arr).toEqual(expect.arrayContaining(arr.sort().reverse()));
}
