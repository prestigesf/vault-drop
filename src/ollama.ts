import { requestUrl } from "obsidian";

export interface OllamaMeta {
	tags: string[];
	links: string[];
}

export async function enrichWithOllama(
	content: string,
	host: string,
	model: string,
): Promise<OllamaMeta | null> {
	const prompt = `Analyze this note. Return JSON only with keys "tags" (2-4 strings, no #) and "links" (2-3 concept names, no brackets).\n\n${content.slice(0, 1500)}`;
	try {
		const res = await requestUrl({
			url: `${host.replace(/\/$/, "")}/api/generate`,
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model,
				prompt,
				format: "json",
				stream: false,
			}),
		});
		const payload = res.json as { response?: string };
		const parsed = JSON.parse(payload.response || "{}") as {
			tags?: unknown;
			links?: unknown;
		};
		const tags = asStrings(parsed.tags)
			.map((t) => t.replace(/^#/, "").trim())
			.filter(Boolean)
			.slice(0, 6);
		const links = asStrings(parsed.links)
			.map((t) => t.replace(/[[\]]/g, "").trim())
			.filter(Boolean)
			.slice(0, 4);
		if (tags.length === 0 && links.length === 0) return null;
		return { tags, links };
	} catch {
		return null;
	}
}

function asStrings(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === "string");
}
