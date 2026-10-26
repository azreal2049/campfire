# Campfire — Architecture and Agent Guidance

## Product

Campfire is a local-first social workspace for small, timed collaboration rooms.
Rooms support countdown, deadman (chat activity adds five minutes), and
Pomodoro timers. The current app shell is intentionally blank while the UI is
being rebuilt as new pages.

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

## Reusable UI components

- `src/App.tsx` intentionally renders a blank page; do not restore the previous
  landing, sign-in, lobby, or fixed three-column shell unless requested.
- The previous interface and feature components are retained under
  `src/components/_legacy/`, with the landing and sign-in pages under
  `src/pages/`. Reuse and place these pieces in the new pages as requested;
  do not delete them as part of clearing the old UI.
- New pages should be built and wired in their respective page components.

## Preserved behavior

- Keep the app usable without Supabase credentials. State and collaboration
  features currently operate locally in the browser.
- Code execution sends editor content to the Piston API only when the user
  presses Run. If the API is unavailable, the terminal reports the failure and
  uses the intentionally limited literal-print and arithmetic offline evaluator.
- Keep user-visible errors explicit; do not add dead buttons or silent
  success-shaped fallbacks.

## Verification

- `npm run build` runs the TypeScript project build and production Vite build.
- `npm run lint` runs Oxlint.
