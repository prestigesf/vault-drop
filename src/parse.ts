export interface ParsedNote {
	title: string;
	body: string;
}

export function filenameFor(title: string): string {
	const cleaned = title
		.replace(/[/\\:*?"<>|#[\]]/g, "-")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 120);
	return cleaned || "Untitled";
}

export function parseNotes(raw: string, splitOnRule: boolean): ParsedNote[] {
	const text = raw.replace(/\r\n/g, "\n").trim();
	if (!text) return [];

	const chunks = splitOnRule
		? text.split(/^\s*---\s*$/m).map((c) => c.trim()).filter(Boolean)
		: [text];

	return chunks.map((chunk, i) => {
		const lines = chunk.split("\n");
		const first = (lines[0] ?? "").trim();

		if (first.startsWith("# ")) {
			return {
				title: first.slice(2).trim() || `Note ${i + 1}`,
				body: lines.slice(1).join("\n").trim(),
			};
		}

		if (first.length > 0 && first.length <= 80 && lines.length > 1) {
			return {
				title: first,
				body: lines.slice(1).join("\n").trim(),
			};
		}

		const fallback =
			first.slice(0, 48) || `Note ${i + 1}`;
		return { title: fallback, body: chunk };
	});
}

export function withFrontmatter(body: string, enabled: boolean): string {
	if (!enabled) return body.endsWith("\n") ? body : `${body}\n`;
	const day = new Date().toISOString().slice(0, 10);
	const block = `---\ndumped: ${day}\nsource: apple-notes\n---\n\n`;
	return `${block}${body.endsWith("\n") ? body : `${body}\n`}`;
}
