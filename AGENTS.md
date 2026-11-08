# AGENTS.md — tao-ui monorepo

Bun workspaces monorepo. Two publishable packages, each with its own build, docs and verification gate.

## Layout

- `packages/tao-ui` — `@rockshin/tao-ui`. Rslib component library (React 18.2/19), Rstest tests, Rspress docs, Storybook, Biome. Package-level guide: `packages/tao-ui/CLAUDE.md`.
- `packages/icons` — `@rockshin/tao-icons`. 2,126 generated React icon modules, canonical geometry in `data/`, frozen SHA-256 baselines, node:test harness, real-tgz consumer and Next checks. Package-level guide: `packages/icons/AGENTS.md` and `HARNESS.md`.
- Root: workspace scripts, CI workflows, shared agent instructions. No runtime code.

## Commands (from the repository root)

- `bun install` — installs all workspaces from the single root lockfile. Never run `npm install` / `npm ci` here; there is no `package-lock.json`.
- `bun run build` — both packages. `bun run build:tao-ui` / `bun run build:icons` for one.
- `bun run lint`, `bun run typecheck`, `bun run test` — tao-ui quality gates.
- `bun run doc`, `bun run storybook` — tao-ui docs and component explorer.
- `bun run icons:check`, `bun run icons:verify` — icon drift/build/pack gate and the heavier consumer gate.
- `bun run release <version>` — tao-ui release (main branch only). `bun run release:icons` — icon metadata guard.

## Non-negotiables

- **Generated icon sources are never hand-edited.** `packages/icons/src/icons/*.tsx` and `src/index.ts` come from `scripts/generate.mjs` over `data/icons.json`; `generate:check` fails on drift. New artwork gets its own integrity snapshot under `tests/fixtures/`.
- **Icon baselines stay frozen.** Approved v1.2.0, v1.3.0-preview.2 and the generic-candidate baselines keep their SHA-256 values; do not refresh hashes to make a check pass.
- **tao-ui package.json `sideEffects` whitelist stays.** Dropping `./dist/index.js` / `./src/index.tsx` from it silently removes the theme CSS under strict tree-shakers.
- **React stays a peer dependency in both packages.** tao-ui supports React 18.2+; icons peers `^18.2.0 || ^19.0.0`.
- **Package boundaries stay clean.** `@rockshin/tao-icons` has no runtime dependencies; `@rockshin/tao-ui` keeps its Radix/rc/dayjs dependencies.
- **Build toolchain is Rslib 1.x for both packages.** tao-ui uses `^1.0.3`, the icons package pins `1.0.3`; do not reintroduce a 0.x Rslib or a second Rsbuild major. Rslib 1 emits `.js`-extension declaration redirects and `modern-module` ESM externals — check consumer types when changing build config.
- **No package-lock files in either package.** The root `bun.lockb` is the only lockfile; icon consumer fixtures keep their own frozen `package-lock.json` because they install a real tarball in isolation.

## Verification before landing changes

- tao-ui: `bun run lint`, `bun run typecheck`, `bun run test`, `bun run test:types`, `bun run test:package`, `bun run build`, `bun run docs:check`, `bun run check:components`.
- icons: `bun run icons:check` (add `icons:verify` for API/build-config/packaging changes).
- Report real command output; do not weaken checks, budgets or assertions to get green.
