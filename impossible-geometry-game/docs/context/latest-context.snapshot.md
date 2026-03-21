# Context Snapshot

Generated at: 2026-03-21T10:08:59.560Z

## Summary
- Chapters: 1
- Levels: 3
- Interactables: 4

## Levels
- chapter1-level1: L1 · First Steps | mechanics=none | n0 -> n3
- chapter1-level2: L2 · Turning Tower | mechanics=rotate | n0 -> n3
- chapter1-level3: L3 · Sliding Mirage | mechanics=slide, lift, rotate | n0 -> n4

## Public Interfaces
- LevelDef (with anchors)
- EdgeDef.kind = real | conditional | illusory
- SaveDataV1 (versioned save schema)
- validate-levels CLI: input level directory, output machine-readable result

## Notes
- Snapshot is generated before compression so future sessions can recover implementation context.
- Use npm run package:zip to snapshot + package in one command.
