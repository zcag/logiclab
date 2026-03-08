# Plan — logiclab
_Last updated: 2026-03-08_

## Overview
logiclab is an interactive logic gate playground for the web. Users draw circuits by connecting gate nodes on a canvas, and a live truth table updates as they wire things up. Challenges present a target truth table and a restricted palette of gate types — users figure out how to wire them to match. Curated sections take users from basic gates through combinational circuits (adders, mux, etc.). Built for self-learners; eventually embeddable as interactive material.

## Architecture principles
- **Less code** — the simplest solution that works; no speculative abstractions
- **Separation of concerns** — engine, UI, content, and state are independent layers with no cross-coupling
- **Refactor, don't patch** — new requirements get accommodated at the right abstraction level; no tailored fixes that leak into other layers or create fragile dependencies
- **Changes shouldn't break things** — if a change affects multiple places, that's a sign the abstraction is wrong; fix the abstraction

## Stack & approach
- **Framework:** Vite + React + TypeScript — fast dev, good ecosystem, static output
- **Node editor:** React Flow — most mature, best maintained of the node-flow options
- **Styling:** Tailwind CSS
- **Simulation:** Pure TS logic engine (no React deps) — evaluates a circuit graph for all input combos, produces a truth table
- **Content:** Challenge definitions as TypeScript config objects (gates available, target truth table, description)
- **No backend** — fully static, no server required

## Circuit model
- Circuit = directed graph of gate nodes + edges (connections)
- Gate node: type (AND/OR/NAND/NOT/XOR/etc.), input ports, output ports
- Special nodes: INPUT (toggleable 0/1), OUTPUT (reads final value)
- Simulation: topological sort → evaluate each gate → collect outputs for all 2^n input combos

## Challenge format
Each challenge specifies:
- `id`, `title`, `description`
- `availableGates`: list of gate types the palette shows
- `inputs`: number of input nodes
- `outputs`: number of output nodes
- `targetTable`: truth table rows (or derived from a reference circuit)
- Optional: `hint`, `starterCircuit` (partial wiring to scaffold)

## Feature phases
**MVP**
- Gate primitives: NAND, AND, OR, NOT, XOR
- React Flow canvas + per-challenge palette
- Live truth table (user circuit)
- Target truth table + diff highlighting + match/success detection
- Challenge progression: basic gates → XOR from NAND → half adder → full adder
- Section nav with progress tracking (localStorage)

**Post-MVP**
- Embedding / shareable circuit links
- Text-based HDL format for power users
- Community-authored challenges
- More circuit types (SR latch, mux, decoder, etc.)
