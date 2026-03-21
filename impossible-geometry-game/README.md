# Impossible Geometry Game (MVP)

A browser puzzle prototype inspired by impossible geometry exploration.  
Tech stack: `TypeScript + Three.js + Vite` with DOM overlay UI.

## What is implemented

- Playable loop:
  - Main menu -> level select -> level play -> completion -> unlock next
- Core movement:
  - Click node to pathfind (A*)
  - Invalid clicks give lightweight feedback
- Interactions:
  - Rotate / Slide / Lift interactables with serialized input
  - Interaction animation happens before graph state commit
- Logic truth layer:
  - `Walk Graph` rebuilt from level state
  - Conditional edges and illusory edges (`thresholdNdc`) supported
- Save system:
  - Versioned `SaveDataV1`
  - Stores unlocked/completed levels + settings + last played level
- Utility:
  - Level validator CLI with solvability/state-space checks
  - Context snapshot generation before compression

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
npm run test:e2e
```

## Validate Levels

```bash
npm run validate:levels
```

Outputs machine-readable JSON and returns non-zero exit code on errors.

## Save Context Before Compression

This project includes a pre-compression context snapshot flow:

```bash
npm run context:snapshot
```

This writes:

- `docs/context/latest-context.snapshot.json`
- `docs/context/latest-context.snapshot.md`

To snapshot and create a zip package in one command:

```bash
npm run package:zip
```

## Directory Highlights

- `src/app/bootstrap/game-app.ts`: app lifecycle and main game loop
- `src/gameplay/graph/graph-builder.ts`: walk graph build + illusory edge activation
- `src/gameplay/pathfinding/a-star-pathfinder.ts`: movement pathfinding
- `tools/validate-levels.ts`: static + dynamic solvability validation
- `tools/context-snapshot.ts`: context preservation before packaging
