# Campfire — Architecture and Agent Guidance

## Product

Campfire is a local-first social workspace for small, timed collaboration rooms.
Rooms support countdown, deadman (chat activity adds five minutes), and
Pomodoro timers. The interface uses an obsidian liquid-glass palette and a
fixed three-column layout.

## Stack and source of truth

- React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React, and Zustand 5.
- `src/store/useCampfireStore.ts` owns rooms, active-room selection, messages,
  timer ticks, fuel, editor content, scratchpad notes, and pinned links.
- `src/types/campfire.ts` defines the room, timer, message, participant, supply,
  and editor types.
- Keep Zustand selectors referentially stable: select state primitives,
  functions, or existing arrays directly. Derive rooms with `.find()` and
  filtered values inside the component, never inside a selector.
- `startCampfireTicker()` starts the shared one-second timer engine.

## Layout and components

- `src/App.tsx` defines the fixed 260px Radar rail, flexible center stage, and
  fixed 310px Chat rail. The center contains a 52px header, flexible Supply
  Dock, and 58px voice dock.
- `src/components/layout/RadarSidebar.tsx` switches rooms and opens the
  creation modal. `TopBurnHeader.tsx` shows the room, participants, clock, and
  15-minute Stoke action.
- `src/components/supplies/SupplyDock.tsx` provides the Monaco Dev Rig, shared
  room scratchpad, pinned links, Piston execution, and terminal output.
- `src/components/layout/BottomVoiceDock.tsx` contains local voice controls,
  browser screen capture, and a Web Audio brown-noise generator.
- `src/components/layout/RightChatSidebar.tsx` renders room messages and sends
  chat input. `src/components/modals/CreateCampfireModal.tsx` creates rooms.
- Do not reintroduce the removed layout customizer, floating panel toolbars, or
  overlays. The fixed shell is intentional.

## UX and behavior

- Keep the app usable without Supabase credentials. State and collaboration
  features currently operate locally in the browser.
- Keep timer and clock text tabular; keep buttons and interactive cards on the
  200ms liquid-glass spring transition.
- Code execution sends editor content to the Piston API only when the user
  presses Run. If the API is unavailable, the terminal reports the failure and
  uses the intentionally limited literal-print and arithmetic offline evaluator.
- Keep user-visible errors explicit; do not add dead buttons or silent
  success-shaped fallbacks.

## Verification

- `npm run build` runs the TypeScript project build and production Vite build.
- `npm run lint` runs Oxlint.
