import { CHARSETS, AMBIGUOUS, type Category, type Config } from "./charsets.ts";
import { secureRandomIndex } from "./crypto.ts";

export function buildCharset(
	categories: Category[],
	symbolSet: string | null,
	excludeAmbiguous: boolean,
	exclude: string | null,
): string {
	let charset = "";
	for (const cat of categories) {
		if (cat === "symbols" && symbolSet) {
			charset += symbolSet;
		} else {
			charset += CHARSETS[cat];
		}
	}

	if (excludeAmbiguous) {
		charset = charset
			.split("")
			.filter((c) => !AMBIGUOUS.includes(c))
			.join("");
	}
	if (exclude) {
		charset = charset
			.split("")
			.filter((c) => !exclude.includes(c))
			.join("");
	}

	return [...new Set(charset)].join("");
}

function getCategoryChars(
	cat: Category,
	symbolSet: string | null,
	excludeAmbiguous: boolean,
	exclude: string | null,
): string {
	let chars = cat === "symbols" && symbolSet ? symbolSet : CHARSETS[cat];
	if (excludeAmbiguous) {
		chars = chars
			.split("")
			.filter((c) => !AMBIGUOUS.includes(c))
			.join("");
	}
	if (exclude) {
		chars = chars
			.split("")
			.filter((c) => !exclude.includes(c))
			.join("");
	}
	return chars;
}

function formatPassword(password: string, config: Config): string {
	if (!config.blockSize) return password;

	const blocks: string[] = [];
	for (let i = 0; i < password.length; i += config.blockSize) {
		blocks.push(password.slice(i, i + config.blockSize));
	}
	return blocks.join(config.blockSeparator);
}

export function generate(config: Config, charset: string): string {
	const { length, categories, symbolSet, excludeAmbiguous, exclude, requireEach } = config;

	if (!requireEach || length < categories.length) {
		return formatPassword(
			Array.from({ length }, () => charset[secureRandomIndex(charset.length)]).join(""),
			config,
		);
	}

	const catChars = categories
		.map((c) => getCategoryChars(c, symbolSet, excludeAmbiguous, exclude))
		.filter((s) => s.length > 0);

	for (;;) {
		const password = Array.from(
			{ length },
			() => charset[secureRandomIndex(charset.length)],
		).join("");

		if (catChars.every((chars) => password.split("").some((c) => chars.includes(c)))) {
			return formatPassword(password, config);
		}
	}
}
