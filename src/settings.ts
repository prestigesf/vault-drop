import { App, PluginSettingTab, Setting } from "obsidian";
import type VaultDropPlugin from "./main";

export interface VaultDropSettings {
	folder: string;
	frontmatter: boolean;
	splitOnRule: boolean;
}

export const DEFAULT_SETTINGS: VaultDropSettings = {
	folder: "Apple Notes",
	frontmatter: true,
	splitOnRule: true,
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
	}
}
