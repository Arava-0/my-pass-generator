export const CHARSETS = {
	upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lower: "abcdefghijklmnopqrstuvwxyz",
	digits: "0123456789",
	symbols: "!@#$%^&*()-_=+[]{}|;:',.<>?/`~",
} as const;

export const AMBIGUOUS = "0O1lI|`";
export const UNSAFE_ENV = "$#!`\\\"'{}()[]|;&<>~";
export const SMALL_CHARS = ".,;:'`-_=+^*";

export type Category = keyof typeof CHARSETS;

export interface Config {
	length: number;
	count: number;
	categories: Category[];
	symbolSet: string | null;
	excludeAmbiguous: boolean;
	exclude: string | null;
	requireEach: boolean;
	separator: string;
	blockSize: number | null;
	blockSeparator: string;
}
