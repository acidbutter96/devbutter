# DevButter 3D Portfolio — Cowork Working Rules

This file is auto-loaded as folder instructions for every Cowork task in this project. It combines the Claude Working Rules from the project brief with routing guidance for skills, plugins, and the Linear-driven task workflow.

## Claude Working Rules (from project brief — verbatim)

1. Inspect the existing repository before changing files.
2. Reuse existing architecture and conventions when they are solid.
3. Do not rewrite unrelated files.
4. Keep components focused and typed.
5. Prefer small, verifiable implementation steps.
6. Explain every major architectural decision in code comments only when necessary.
7. Do not add dependencies without a clear reason.
8. Never execute model-generated code.
9. Validate all external and model-generated data.
10. Keep the normal UI independent from the WebGL scene.
11. Test mobile and reduced-motion behavior.
12. Keep the final result visually consistent across every section.

## Standing architectural constraints

- GPT or any LLM must never generate and execute arbitrary frontend code. The AI only returns validated structured commands (see `SceneAction` schema in the brief), and every response must be validated with Zod before it can touch scene state.
- Do not expose raw Three.js objects to the model.
- Stack: Next.js, TypeScript, React, Tailwind, React Three Fiber, Three.js, Drei, GSAP/Framer Motion, Zustand, Zod. Optional FastAPI backend for AI/RAG/agent orchestration.
- Respect the suggested project structure under `src/` (`app/`, `components/`, `three/`, `stores/`, `lib/`, `content/`, `styles/`) — see full tree in the project brief.
- Brand tokens (dark editorial-tech: near-black background, neon green primary accent, magenta/pink secondary accent) live in the palette block of the brief — reuse those CSS variables rather than inventing new ones.

## Skill routing

- Always check `devbutter-context` before writing copy, positioning, or anything referencing DevButter's projects (GranaAI, PetButter, Brota, Arquitetura Multiagente) — it's the source of truth for brand voice and portfolio facts.
- Use `3d-web-experience` for anything touching the React Three Fiber hero, flask/neural-core model, floating cards, or performance/accessibility tradeoffs in the WebGL layer.
- Use `docx`/`pptx`/`xlsx`/`pdf` skills only for deliverables in those formats — never for site code.
- Use `design:accessibility-review` before marking a UI phase complete — required check for WCAG 2.1 AA, keyboard focus, reduced motion.
- Use `engineering:code-review` on any nontrivial diff before opening a PR.

## Linear-driven workflow

- One task = one Linear issue (Devbutter Linear team). Standard task prompt pattern:

  > "Implement DEV-XX from the Devbutter Linear team. Read the issue description and its Cowork Execution Config comment for the recommended model/skills/plugins. Follow this repo's working rules. Open a PR, don't merge. Comment on the Linear issue with a summary and move it to In Review."

- Filter by milestone before picking the next task — Phase 0 → 1 → 2 → 3 → 4 (Phase order from the brief's Implementation Order section). Later phases depend on earlier ones existing (e.g. DEV-93/95/98 depend on DEV-87–91).
- Skip anything labeled `Needs Human` (e.g. DEV-92, DEV-109) — those only get a "prep only" task, never implementation.
- For issues labeled `Model: Opus`, say so explicitly in the task prompt — the model does not auto-upgrade mid-task.
- Never push directly to `main`. Always open a PR.

## Permission mode defaults

- Manual: anything touching credentials, IMAP, Mongo, or other secrets (e.g. DEV-101).
- Auto: everything else — reviewed for safety but not gated on every step.
- Never use Skip mode on this project — real secrets and a production DNS cutover are downstream.

## Acceptance bar (reference)

Before calling a phase or issue done, confirm against the brief's Acceptance Criteria: homepage matches the visual concept, hero has a polished 3D flask/AI core, page is usable without WebGL, project cards are responsive and keyboard-accessible, AI assistant returns validated structured actions only, mobile performance is intentionally optimized, reduced motion is respected, no lorem ipsum, no fabricated metrics.
