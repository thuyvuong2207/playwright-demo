export function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (
        obj1 == null ||
        obj2 == null ||
        typeof obj1 !== "object" ||
        typeof obj2 !== "object"
    ) {
        return false;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }

        const sortedObj1 = [...obj1].sort();
        const sortedObj2 = [...obj2].sort();

        for (let i = 0; i < sortedObj1.length; i++) {
            if (!deepEqual(sortedObj1[i], sortedObj2[i])) {
                return false;
            }
        }
        return true;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}
