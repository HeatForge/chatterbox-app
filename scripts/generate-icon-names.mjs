import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mingcute from "@iconify-json/mingcute/icons.json" with { type: "json" };

const prefix = mingcute.prefix;
const shortNames = [
	...Object.keys(mingcute.icons),
	...Object.keys(mingcute.aliases ?? {}),
].sort();

const unionMembers = shortNames.map((name) => JSON.stringify(name)).join(" | ");
const objectEntries = shortNames
	.map((name) => `\t${JSON.stringify(name)}: ${JSON.stringify(`${prefix}:${name}`)},`)
	.join("\n");

const output = `/** Auto-generated from @iconify-json/mingcute. Run \`npm run icons:generate\` to refresh. */

export type MingcuteShortName = ${unionMembers};

export type MingcuteIconName = \`mingcute:\${MingcuteShortName}\`;

export const ICON_PREFIX = "${prefix}" as const;

export const IconNames = {
${objectEntries}
} as const satisfies Record<MingcuteShortName, MingcuteIconName>;

export function mingcuteIcon(name: MingcuteShortName): MingcuteIconName {
	return IconNames[name];
}
`;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
writeFileSync(join(root, "src/lib/IconNames.ts"), output);
console.log(`Generated ${shortNames.length} mingcute icon names.`);
