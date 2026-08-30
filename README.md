# Vault Drop

Obsidian plugin that dumps pasted Apple Notes into your vault as Markdown.

Works on **iPhone**. Apple does not let a plugin read the Notes app, so you paste (or run the iOS Shortcut), then dump.

## What it does

- Ribbon inbox → dump modal
- Command palette → **Dump pasted notes**
- Command palette → **Hello world** (sample notice)
- Settings: dump folder (`Apple Notes`), frontmatter stamp, split on `---`

## Install on iPhone

1. App Store → Obsidian → create a vault with **Store in iCloud** on
2. Download `main.js`, `manifest.json`, and `styles.css` from this repo
3. In Files, put them in `iCloud Drive/Obsidian/[Vault]/.obsidian/plugins/vault-drop/`
4. Obsidian → Settings → Community plugins → turn restricted mode off → enable **Vault Drop**
5. Ribbon inbox → paste from Notes → Dump

## Develop

```sh
cd path/to/vault/.obsidian/plugins
git clone https://github.com/prestigesf/vault-drop.git
cd vault-drop
npm install
npm run dev
```

Enable **Vault Drop** in Community plugins. Reload after `manifest.json` changes.

Built from the [official sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) tutorial.
