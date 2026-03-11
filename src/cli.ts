import { parseArgs } from "node:util";
import { UNSAFE_ENV, SMALL_CHARS, type Category, type Config } from "./charsets.ts";
import { buildCharset, generate } from "./generator.ts";

function printHelp(): never {
	console.log(`passgen — Ultra-configurable secure password generator

Usage: passgen [options]

Modes:
  (default)               Safe mode — 44 chars, blocks of 11 separated by "-",
                          excludes ambiguous & env-breaking characters
  --raw                   Raw mode — 32 chars, all characters, no blocks

Options:
  -l, --length <n>        Password length (default: 44 safe / 32 raw)
  -c, --count <n>         Number of passwords (default: 1)
  -U, --no-upper          Disable uppercase letters
  -L, --no-lower          Disable lowercase letters
  -D, --no-digits         Disable digits
  -S, --no-symbols        Disable symbols
      --symbol-set <s>    Custom symbol characters
  -x, --exclude-ambiguous Exclude ambiguous chars (0O, 1lI, |, \`)
      --exclude <s>       Exclude specific characters
      --no-require-each   Don't require one char from each category
      --separator <s>     Separator between passwords (default: newline)
      --block-size <n>    Split password into blocks of n characters
      --block-sep <s>     Separator between blocks (default: "-")
  -h, --help              Show this help

Examples:
  passgen                 Safe: Xt7wkR9mFpN-z4v8eQjYdAH-w2xKcM6gBsT-5nRfWq3jPab
  passgen --raw           Raw:  b/e&:pf['4PW}am}#\`5$f'N8f)h}.{u|
  passgen --raw -l 64     Raw 64 chars, all characters
  passgen -l 24           Safe 24 chars with blocks`);
	Deno.exit(0);
}

const OPTIONS = {
	length: { type: "string", short: "l" },
	count: { type: "string", short: "c", default: "1" },
	raw: { type: "boolean", default: false },
	"no-upper": { type: "boolean", short: "U", default: false },
	"no-lower": { type: "boolean", short: "L", default: false },
	"no-digits": { type: "boolean", short: "D", default: false },
	"no-symbols": { type: "boolean", short: "S", default: false },
	"symbol-set": { type: "string" },
	"exclude-ambiguous": { type: "boolean", short: "x", default: false },
	exclude: { type: "string" },
	"no-require-each": { type: "boolean", default: false },
	separator: { type: "string", default: "\n" },
	"block-size": { type: "string" },
	"block-sep": { type: "string", default: "-" },
	help: { type: "boolean", short: "h", default: false },
} as const;

if (Deno.args.includes("--help") || Deno.args.includes("-h") || Deno.args.includes("-help")) {
	printHelp();
}

let values: typeof parsed.values;
try {
	var parsed = parseArgs({ options: OPTIONS, strict: true, allowPositionals: false });
	values = parsed.values;
} catch (e) {
	console.error(`Error: ${(e as Error).message}\nRun "passgen --help" for usage.`);
	Deno.exit(1);
}

const isRaw = values.raw;
const isSafe = !isRaw;

const length = values.length
	? parseInt(values.length, 10)
	: isSafe ? 44 : 32;

const count = parseInt(values.count!, 10);

if (isNaN(length) || length < 1) {
	console.error("Error: length must be a positive integer");
	Deno.exit(1);
}
if (isNaN(count) || count < 1) {
	console.error("Error: count must be a positive integer");
	Deno.exit(1);
}

const categories: Category[] = [];
if (!values["no-upper"]) categories.push("upper");
if (!values["no-lower"]) categories.push("lower");
if (!values["no-digits"]) categories.push("digits");
if (!values["no-symbols"]) categories.push("symbols");

const symbolSet = values["symbol-set"] ?? null;

const excludeAmbiguous = isSafe ? true : values["exclude-ambiguous"]!;
const baseExclude = values.exclude ?? null;
const exclude = isSafe
	? (baseExclude ? baseExclude + UNSAFE_ENV + SMALL_CHARS : UNSAFE_ENV + SMALL_CHARS)
	: baseExclude;

const requireEach = !values["no-require-each"];
const separator = values.separator!;

const blockSize = values["block-size"]
	? parseInt(values["block-size"], 10)
	: isSafe ? 11 : null;

const blockSeparator = values["block-sep"]!;

const config: Config = {
	length,
	count,
	categories,
	symbolSet,
	excludeAmbiguous,
	exclude,
	requireEach,
	separator,
	blockSize,
	blockSeparator,
};

const charset = buildCharset(categories, symbolSet, excludeAmbiguous, exclude);

if (charset.length === 0) {
	console.error("Error: no characters available (check your flags)");
	Deno.exit(1);
}

const passwords = Array.from({ length: count }, () => generate(config, charset));

console.log(passwords.join(separator));
