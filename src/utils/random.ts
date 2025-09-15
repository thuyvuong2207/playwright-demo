import { faker } from "@faker-js/faker";
export function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randomNumberString(length: number) {
    return faker.string.numeric(length);
}
export function randomCode(length: number) {
    return faker.string.alphanumeric(length);
}
export function randomFullNameName() {
    return faker.person.fullName();
}

export function randomFirstName() {
    return faker.person.firstName();
}

export function randomLastName() {
    return faker.person.lastName();
}

export function randomPhoneNumber() {
    return faker.phone.number();
}

export function randomEmail() {
    return faker.internet.email();
}

export function randomPassword() {
    return faker.internet.password();
}

export function randomUuid() {
    return faker.string.uuid();
}

// Generate a random phone number, using format: +1 (###) ###-####
export function randomPhoneNumberWithFormat(format = "+1 250 ###-####") {
    return faker.phone.number(format);
}
export function randomMembers<T>(
    arr: T[],
    count: number,
    isUnique = true
): T[] {
    const result: T[] = [];
    if (isUnique) {
        if (count > new Set(arr).size) {
            throw new Error(
                "Count must be less than or equal to unique array length"
            );
        }
        const shuffledArr = [...arr].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
            result.push(shuffledArr[i]);
        }
    } else {
        if (count > arr.length) {
            throw new Error("Count must be less than or equal to array length");
        }
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            result.push(arr[randomIndex]);
        }
    }
    return result;
}
export function randomMember<T>(arr: T[]): T {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}
if (require.main === module) {
    // Example usage
    console.log(randomPhoneNumberWithFormat());
}