# Context Snapshot

Generated at: 2026-03-21T14:05:10.309Z

## Summary
- Chapters: 1
- Levels: 8
- Interactables: 25

## Levels
- chapter1-level1: 第一关·初见回廊 | mechanics=none | n0 -> n5
- chapter1-level2: 第二关·旋塔分岔 | mechanics=rotate | n0 -> n5
- chapter1-level3: 第三关·镜桥试炼 | mechanics=slide, lift, rotate | n0 -> n6
- chapter1-level4: 第四关·双塔并轨 | mechanics=rotate, slide | n0 -> n6
- chapter1-level5: 第五关·错层回廊 | mechanics=lift, slide, rotate | n0 -> n7
- chapter1-level6: 第六关·三相棱镜 | mechanics=rotate, lift, slide | n0 -> n6
- chapter1-level7: 第七关·逆向校准 | mechanics=rotate, slide, lift | n0 -> n7
- chapter1-level8: 第八关·天穹终局 | mechanics=rotate, slide, lift | n0 -> n9

## Public Interfaces
- LevelDef (with anchors)
- EdgeDef.kind = real | conditional | illusory
- SaveDataV1 (versioned save schema)
- validate-levels CLI: input level directory, output machine-readable result

## Notes
- Snapshot is generated before compression so future sessions can recover implementation context.
- Use npm run package:zip to snapshot + package in one command.
