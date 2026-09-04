# Vault Drop

Obsidian plugin that dumps Apple Notes into your vault as Markdown.

Works on **iPhone** (paste dump) and **Mac** (osascript bridge + optional Ollama tags).

## What it does

- Ribbon inbox → dump modal
- Command palette → **Dump pasted notes**
- Optional desktop Ollama: tags + `[[wikilinks]]` from llama3.2
- Settings: dump folder, frontmatter, split on `---`, Ollama URL/model

## Offline architecture

1. Capture in Apple Notes on the phone
2. On a Mac: `python3 scripts/sync_notes_to_vault.py` (or the launchd plist every 30 min)
3. In Obsidian: Vault Drop, Smart Connections (`nomic-embed-text`), Copilot (`llama3.2`) against local Ollama

```sh
ollama pull llama3.2
ollama pull nomic-embed-text
export OBSIDIAN_VAULT_PATH="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes"
python3 scripts/sync_notes_to_vault.py
```

The bridge **does not run on iPhone**. Phone path: paste into the dump modal.

## Install on iPhone

1. Settings → Community plugins → Turn on community plugins
2. Browse → install **BRAT** → Enable
3. BRAT → Add beta plugin → `prestigesf/vault-drop`
4. Enable **Vault Drop**

## Develop

```sh
cd path/to/vault/.obsidian/plugins
git clone https://github.com/prestigesf/vault-drop.git
cd vault-drop
npm install
npm run dev
```

Built from the [official sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin) tutorial.
