# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is **not a software codebase**. It is an Obsidian vault (`.obsidian/` config present) used as a lab notebook for plant molecular biology work at 농진청 (Rural Development Administration). Content is in Korean and consists of Markdown notes, embedded images, and one Obsidian Bases view file. There is nothing to build, lint, or test.

## Structure

- `9월/` — Dated lab journal entries, one file per week (`1주차.md` … `5주차.md`, i.e. "week 1" … "week N"). Entries inside a weekly file are subdivided by date (e.g. `9/28 월`) with numbered task lists for that day.
- `Method/` — Standalone protocol/recipe reference notes (PCR thermocycler programs, master mix recipes, gel electrophoresis settings, plant/seed handling procedures). These are linked from journal entries rather than duplicated inline.
- `사진/` — Image files (PCR gel photos, primer info screenshots) referenced from notes via Obsidian embeds.
- `study/` — Currently empty.
- `무제.base` — An Obsidian Bases plugin file defining a table view over vault notes.

## Conventions used in the notes

- Daily/weekly journal entries reference protocols with Obsidian wikilinks, e.g. `[[프로토플라스트 심기]]`, `[[pcr sil]]`, `[[마스터 믹스 키트]]`, `[[전기영동 기본]]` — these resolve to files under `Method/`.
- Images are embedded with `![[filename.jpg|width]]` syntax and referenced results/evidence often link directly to a `사진/` file.
- `Method/` notes are terse recipes/parameters (e.g. reaction volumes per primer/template/buffer, thermocycler stage/step temperatures and times, voltage/time for gel runs) rather than prose explanations — keep additions in that same compact format.

## Working in this vault

- When adding or editing notes, preserve the existing bilingual/terse note style (short Korean phrases, numbered steps) rather than expanding into full prose unless asked.
- When a journal entry references a technique or recipe, prefer linking to (or creating) a `Method/` note over inlining protocol details into the journal entry.
- Do not treat `.md` files here as source code to refactor — edits should preserve the author's original notes and only change what is asked.
