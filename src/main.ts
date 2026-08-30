import { Modal, Notice, Plugin, Setting, TFolder } from "obsidian";
import { parseNotes, filenameFor, withFrontmatter } from "./parse";
import {
	DEFAULT_SETTINGS,
	VaultDropSettingTab,
	type VaultDropSettings,
} from "./settings";

export default class VaultDropPlugin extends Plugin {
	settings!: VaultDropSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("inbox", "Dump notes", () => {
			new DumpModal(this).open();
		});

		this.addCommand({
			id: "open-dump-modal",
			name: "Dump pasted notes",
			callback: () => new DumpModal(this).open(),
		});

		this.addCommand({
			id: "greet",
			name: "Hello world",
			callback: () => new Notice("Hello, world!"),
		});

		this.addSettingTab(new VaultDropSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<VaultDropSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async dumpNotes(raw: string): Promise<number> {
		const notes = parseNotes(raw, this.settings.splitOnRule);
		if (notes.length === 0) {
			new Notice("Nothing to dump.");
			return 0;
		}

		const folder = this.settings.folder.replace(/^\/+|\/+$/g, "");
		await this.ensureFolder(folder);

		let written = 0;
		for (const note of notes) {
			const path = await this.uniquePath(folder, filenameFor(note.title));
			const content = withFrontmatter(note.body, this.settings.frontmatter);
			await this.app.vault.create(path, content);
			written += 1;
		}

		new Notice(
			written === 1
				? `Dumped 1 note into ${folder}`
				: `Dumped ${written} notes into ${folder}`,
		);
		return written;
	}

	private async ensureFolder(folder: string) {
		if (!folder) return;
		const existing = this.app.vault.getAbstractFileByPath(folder);
		if (existing instanceof TFolder) return;
		if (existing) {
			throw new Error(`${folder} exists and is not a folder`);
		}
		await this.app.vault.createFolder(folder);
	}

	private async uniquePath(folder: string, name: string): Promise<string> {
		const dir = folder ? `${folder}/` : "";
		let path = `${dir}${name}.md`;
		let n = 2;
		while (this.app.vault.getAbstractFileByPath(path)) {
			path = `${dir}${name} ${n}.md`;
			n += 1;
		}
		return path;
	}
}

class DumpModal extends Modal {
	plugin: VaultDropPlugin;
	draft = "";

	constructor(plugin: VaultDropPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("vault-drop-modal");

		contentEl.createEl("h2", { text: "Dump notes" });
		contentEl.createEl("p", {
			cls: "vault-drop-help",
			text: "Paste from Apple Notes. First line becomes the title. A line with only --- starts the next note.",
		});

		const area = contentEl.createEl("textarea", {
			cls: "vault-drop-textarea",
			attr: {
				placeholder:
					"Meeting with Jordan\nShip the npm package tonight.\n\n---\n\n# Launch post\nLead with the table, not LangChain alternative.",
			},
		});
		area.value = this.draft;
		area.addEventListener("input", () => {
			this.draft = area.value;
		});

		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Dump into vault")
				.setCta()
				.onClick(async () => {
					const n = await this.plugin.dumpNotes(area.value);
					if (n > 0) this.close();
				}),
		);
	}

	onClose() {
		this.contentEl.empty();
	}
}
