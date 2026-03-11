import { randomBytes } from "node:crypto";

export function secureRandomIndex(max: number): number {
	const limit = Math.floor(0x100000000 / max) * max;
	let value: number;
	do {
		value = randomBytes(4).readUInt32BE();
	} while (value >= limit);
	return value % max;
}
