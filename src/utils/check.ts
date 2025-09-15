import { checkMatched, isMatch } from "./match";
import { checkRange, isInRange } from "./range";
import { checkSorted, isSorted } from "./sort";

export const gridCheck = {
	checkRange: checkRange,
	checkSorted: checkSorted,
	checkMatched: checkMatched,
	isInRange: isInRange,
	isSorted: isSorted,
	isMatch: isMatch,
};
