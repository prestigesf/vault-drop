#!/usr/bin/env python3
"""Apple Notes → Obsidian vault. macOS only (osascript). Optional Ollama tags."""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import urllib.error
import urllib.request
from pathlib import Path

VAULT = Path(os.environ.get("OBSIDIAN_VAULT_PATH", str(Path.home() / "Documents" / "ObsidianVault")))
SYNC_FOLDER = os.environ.get("SYNC_FOLDER_NAME", "Apple Notes")
NOTES_FOLDER = os.environ.get("APPLE_NOTES_FOLDER", "")  # empty = all notes
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
USE_OLLAMA = os.environ.get("OLLAMA_ENABLED", "1") != "0"


def sanitize(name: str) -> str:
    cleaned = re.sub(r'[/\\:*?"<>|#\[\]]', "-", name)
    return re.sub(r"\s+", " ", cleaned).strip()[:120] or "Untitled"


def fetch_notes() -> list[tuple[str, str]]:
    folder_line = (
        f'set targetNotes to notes of folder "{NOTES_FOLDER}"'
        if NOTES_FOLDER
        else "set targetNotes to notes"
    )
    script = f"""
    tell application "Notes"
        set output to ""
        {folder_line}
        repeat with n in targetNotes
            set nTitle to name of n
            set nBody to plaintext of n
            set output to output & "===NOTE_SPLIT===" & linefeed & nTitle & linefeed & "===CONTENT_SPLIT===" & linefeed & nBody & linefeed
        end repeat
        return output
    end tell
    """
    proc = subprocess.run(
        ["osascript", "-e", script],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise SystemExit(proc.stderr or "osascript failed. This script only runs on a Mac.")
    notes: list[tuple[str, str]] = []
    for chunk in proc.stdout.split("===NOTE_SPLIT===\n"):
        if "===CONTENT_SPLIT===" not in chunk:
            continue
        title, body = chunk.split("===CONTENT_SPLIT===\n", 1)
        title = title.strip()
        if title:
            notes.append((title, body.strip()))
    return notes


def ollama_meta(content: str) -> dict:
    if not USE_OLLAMA:
        return {}
    payload = {
        "model": MODEL,
        "prompt": (
            "Analyze this note. Return JSON only with keys "
            '"tags" (2-4 strings, no #) and "links" (2-3 concept names, no brackets).\n\n'
            + content[:1500]
        ),
        "format": "json",
        "stream": False,
    }
    req = urllib.request.Request(
        f"{OLLAMA_HOST}/api/generate",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            raw = json.loads(res.read().decode()).get("response", "{}")
            data = json.loads(raw) if isinstance(raw, str) else raw
            tags = [str(t).lstrip("#").strip() for t in data.get("tags", []) if t][:6]
            links = [str(t).replace("[", "").replace("]", "").strip() for t in data.get("links", []) if t][:4]
            return {"tags": tags, "links": links}
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
        return {}


def write_note(title: str, body: str, dest: Path) -> bool:
    path = dest / f"{sanitize(title)}.md"
    digest = hashlib.sha256(body.encode()).hexdigest()[:16]
    if path.exists() and digest in path.read_text(encoding="utf-8"):
        return False
    meta = ollama_meta(body)
    lines = [
        "---",
        f'title: {json.dumps(title)}',
        "source: apple-notes",
        f"content_hash: {digest}",
    ]
    tags = meta.get("tags") or []
    if tags:
        lines.append("tags:")
        lines.extend(f"  - {json.dumps(tag)}" for tag in tags)
    lines += ["---", "", f"# {title}", "", body, ""]
    links = meta.get("links") or []
    if links:
        lines += ["---", " · ".join(f"[[{name}]]" for name in links), ""]
    path.write_text("\n".join(lines), encoding="utf-8")
    return True


def main() -> None:
    dest = VAULT / SYNC_FOLDER
    dest.mkdir(parents=True, exist_ok=True)
    print(f"Vault: {dest}")
    notes = fetch_notes()
    print(f"Found {len(notes)} Apple Note(s).")
    written = 0
    for title, body in notes:
        if write_note(title, body, dest):
            written += 1
            print(f"Synced: {sanitize(title)}.md")
    print(f"Wrote {written} file(s).")


if __name__ == "__main__":
    main()
