# Decisions — logiclab

- 2026-03-08: [tech] Vite + React + TypeScript for the frontend — fast iteration, static output, no backend needed
- 2026-03-08: [tech] React Flow for the node editor — most mature and maintained of the options considered (vs rete.js, litegraph)
- 2026-03-08: [tech] Tailwind CSS for styling
- 2026-03-08: [tech] Pure TS simulation engine with no React deps — evaluates circuit graph via topological sort
- 2026-03-08: [tech] Challenge definitions as TS config objects (availableGates, targetTable, inputs/outputs, description)
- 2026-03-08: [scope] MVP is frontend-only, no backend
- 2026-03-08: [scope] Each challenge specifies which gate types are available in the palette
- 2026-03-08: [scope] Previously solved gates can become available primitives in later challenges
- 2026-03-08: [scope] Embedding/sharing deferred post-MVP
- 2026-03-08: [scope] HDL text format deferred post-MVP
- 2026-03-08: [scope] Hosting target not decided — not blocking MVP
- 2026-03-08: [business] Primary user: builder himself; eventual audience: self-learners (same as nand2tetris)
- 2026-03-08: [business] logiclab is the tool/engine; course content (lessons, curriculum) is a separate concern for later
- 2026-03-08: [tech] Wire signal state visualized via color + glow/pulse — active (1) wires glow or pulse, inactive (0) are muted/grey; no dot-flow animation
- 2026-03-08: [tech] Gate palette is a draggable sidebar showing only the gates allowed by the current challenge
- 2026-03-08: [tech] ARCHITECTURE PRINCIPLE: less code is better; strict separation of concerns (engine, UI, content, state are independent layers); changes must be made at the right abstraction level — refactor to accommodate new requirements rather than tailoring fixes into singular places; no hacks that couple layers or create fragile dependencies
