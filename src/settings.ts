import { App, PluginSettingTab, Setting } from "obsidian";
import type VaultDropPlugin from "./main";

export interface VaultDropSettings {
	folder: string;
	frontmatter: boolean;
	splitOnRule: boolean;
	ollamaEnabled: boolean;
	ollamaHost: string;
	ollamaModel: string;
}

export const DEFAULT_SETTINGS: VaultDropSettings = {
	folder: "Apple Notes",
	frontmatter: true,
	splitOnRule: true,
	ollamaEnabled: false,
	ollamaHost: "http://127.0.0.1:11434",
	ollamaModel: "llama3.2",
};

export class VaultDropSettingTab extends PluginSettingTab {
	plugin: VaultDropPlugin;

	constructor(app: App, plugin: VaultDropPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Dump folder")
			.setDesc("Notes land in this folder inside the vault.")
			.addText((text) =>
				text
					.setPlaceholder("Apple Notes")
					.setValue(this.plugin.settings.folder)
					.onChange(async (value) => {
						this.plugin.settings.folder = value.trim() || "Apple Notes";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Add dump frontmatter")
			.setDesc("Stamp each file with dumped date and source: apple-notes.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.frontmatter)
					.onChange(async (value) => {
						this.plugin.settings.frontmatter = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Split on ---")
			.setDesc("A line that is only --- starts a new note in the dump modal.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.splitOnRule)
					.onChange(async (value) => {
						this.plugin.settings.splitOnRule = value;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("h3", { text: "Local Ollama" });
		containerEl.createEl("p", {
			cls: "setting-item-description",
			text: "Desktop only. Tags and [[wikilinks]] from llama3.2. Phone dumps skip this.",
		});

		new Setting(containerEl)
			.setName("Enrich dumps with Ollama")
			.setDesc("Needs Ollama running locally. Fails open if it is not.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.ollamaEnabled)
					.onChange(async (value) => {
						this.plugin.settings.ollamaEnabled = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Ollama URL")
			.addText((text) =>
				text
					.setPlaceholder("http://127.0.0.1:11434")
					.setValue(this.plugin.settings.ollamaHost)
					.onChange(async (value) => {
						this.plugin.settings.ollamaHost =
							value.trim() || "http://127.0.0.1:11434";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Model")
			.addText((text) =>
				text
					.setPlaceholder("llama3.2")
					.setValue(this.plugin.settings.ollamaModel)
					.onChange(async (value) => {
						this.plugin.settings.ollamaModel = value.trim() || "llama3.2";
						await this.plugin.saveSettings();
					}),
			);
	}
}
