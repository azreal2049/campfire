# 🔥 Campfire

### Local-first collaboration workspace — UI rebuild in progress

**Ephemeral rooms for focused study, coding, and creative work.** Campfire combines a room-and-presence-inspired workspace with compact chat, a shared-feeling tool dock, and timers that make every session intentional.

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-443E38">
  <img alt="Piston Code Engine" src="https://img.shields.io/badge/Code_Engine-Piston-7C3AED">
  <img alt="Web Audio API" src="https://img.shields.io/badge/Audio-Web_Audio_API-22C55E">
  <img alt="Liquid Glass UI" src="https://img.shields.io/badge/UI-60Hz_Liquid_Glass-111114?labelColor=777777">
</p>

> **Project status:** The current app opens to a blank page while the UI is rebuilt. Existing page, component, and feature code is retained for reuse. Room state runs locally in the browser; real-time multi-user room sync and voice transport are not currently provided.

## Vision

Campfire is built around small, time-boxed rooms—called *campfires*—for people who want to make progress together without the overhead of a large community server. The product borrows familiar room presence and voice-control patterns, pairs them with clean, dense messaging, and adds an ephemeral timer to keep sessions focused.

Each room can use one of three burn modes:

- **COUNTDOWN** — a fixed-duration focus session.
- **POMODORO** — a focus sprint with a break phase.
- **DEADMAN** — room activity fuels the timer, extending the session.

The app is built with React 19, TypeScript, Vite, Tailwind CSS 4, Lucide icons, and Zustand 5. The previous visual language and pages are retained in source but are not mounted in the current blank app shell.

## Features

### 📡 Radar Sidebar & Campfire Core

- Live room cards show timer progress, burn mode, participant count, and the active room.
- **Light a Campfire** opens the room creation flow.
- **Quick Switcher** (`Ctrl+K` / `⌘K`) searches rooms and exposes room actions.
- The bottom-left user pod provides Online, Idle, Do Not Disturb, and Invisible statuses, a custom status, microphone/deafen controls, and profile/settings access.
- Full-screen user settings cover profile, voice preferences, appearance, soundscape, AI endpoint, and shortcuts.
- Room settings include name, topic, timer mode, category, slowmode, fuel adjustments, and deletion.
- The invite dialog provides a room link and local participant actions.

**Local-first note:** participants and room state are browser-local. The UI does not currently provide network-backed presence, voice calls, or synchronized invitations.

### 💻 Collaborative Dev Rig

- Multi-file workspace explorer and Monaco editor.
- Local teammate cursor/presence indicators are illustrative UI, not network collaboration.
- Run Python, JavaScript, TypeScript, or C++ through the Piston execution API when you choose **Run**.
- If Piston is unavailable, a deliberately limited offline evaluator supports literal `print`/`console.log` and basic arithmetic; it is not a general-purpose sandbox.
- Static code-audit hints for complexity, TODOs, and common review checks.
- Git-style local workspace snapshots with restore support.
- HTML preview drawer for workspace files.

### 🧠 Solvely Study Solver

- Enter a question or drop, upload, or paste an image.
- Requests step-by-step explanations from the configured OpenAI-compatible local model endpoint; the default endpoint is `http://127.0.0.1:31415`.
- Explicit offline guide fallback when the model is unavailable; results indicate which source was used.
- Expandable **Why? / Explain Deeper** reasoning for lesson steps.
- Flip-through study cards and a four-question sprint quiz.

The solver currently does not include a scientific formula-pad editor, interactive function plotter, or 3D card renderer. The image workflow depends on a compatible vision model at the configured endpoint.

### 🎨 Interactive Whiteboard Tutor

- HTML canvas tools include pen, highlighter, line/vector, rectangle, circle, text, laser, and eraser.
- Dot-grid, coordinate-graph, and plain obsidian backgrounds.
- Undo/redo, export to PNG, and local persistence of room marks.
- The tutor can request concise lesson steps from the configured local model, progressively draw lesson cards, and read the selected step aloud with the Web Speech API.
- When the tutor endpoint is unavailable, it reports the issue and uses a built-in guide.

### 🌊 Procedural Soundscape Studio

- Web Audio API-generated Deep Brown Noise, Midnight Rain, Campfire Crackle, and binaural focus tones.
- Per-track volume controls and stop-all action.
- Audio is generated in the browser; no external audio tracks are streamed.
- Input-device selection and microphone testing are available where supported. Output-device routing depends on browser `AudioContext.setSinkId` support.

## Architecture at a glance

```text
src/
  App.tsx                         Blank shell for the UI rebuild
  pages/                          Retained landing and sign-in pages
  components/
    _legacy/                      Retained previous UI and feature components
  store/useCampfireStore.ts        Local room, profile, timer, and tool state
  types/campfire.ts                Shared TypeScript domain types
```

Zustand selectors should return existing state values (primitives, functions, or existing arrays). Derive filtered lists and room lookups in components rather than creating arrays or objects inside selectors. `startCampfireTicker()` owns the shared one-second room timer engine.

## Requirements

- Node.js 20.19+ or 22.12+ (compatible with the current Vite toolchain)
- npm
- A modern browser; microphone tests require permission and a secure context (`localhost` is supported)
- Optional: a compatible local model proxy at `http://127.0.0.1:31415` for model-assisted solver and whiteboard responses

## Get started

```bash
git clone https://github.com/azreal2049/campfire.git
cd campfire
npm install
npm run dev
```

Vite prints the local preview URL, typically `http://localhost:5173`.

## Development commands

```bash
npm run dev       # Start the Vite development server
npm run autosync  # Run one safe push check for committed main changes
npm run autosync:install   # Windows: schedule checks every 24 hours
npm run autosync:uninstall # Windows: remove the scheduled task
npm run build     # TypeScript project build and production Vite build
npm run lint      # Run Oxlint
npm run preview   # Preview the production build locally
```

## Team collaboration workflow

The UI is currently local-first, so Git is the source-control collaboration path between contributors:

1. Clone the repository and install dependencies using the commands above.
2. Before starting work, run `git pull --rebase`.
3. Make and verify a focused change with `npm run build` and `npm run lint`.
4. Review the staged diff, commit with a descriptive message, and push your branch.
5. Open a pull request for review before merging shared changes.

On Windows, `npm run autosync:install` registers a per-user Task Scheduler task that checks once every 24 hours and pushes **already-committed changes on `main` only** to `origin/main`. It does not stage files, create commits, or push other branches. If the remote has commits missing locally, the task skips the push and asks you to reconcile the branch manually. The task uses the current user's Git credentials and runs while that user is signed in. Use `npm run autosync:uninstall` to remove it. `npm run autosync` runs a single check immediately.

Review and commit changes normally; uncommitted and untracked files are never uploaded by autosync. Do not commit secrets or unfinished work to `main`. VS Code auto-fetch is enabled independently of this push schedule.

## Current boundaries

- Room state is held locally in Zustand; room changes are not broadcast to other browsers.
- Voice controls and member presence are local UI state, not an internet voice service.
- Invite links are display/share links; sending an invite does not establish a remote participant connection.
- Piston receives source code only after the user invokes Run. Review the service and its data-handling terms before using it with private code.
- The offline code evaluator, solver guide, and audit hints are intentionally limited and should not be treated as a secure execution environment or authoritative professional advice.

## License

No license has been declared yet. All rights are reserved unless a license is added to this repository.
