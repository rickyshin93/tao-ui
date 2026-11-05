# tao-ui monorepo

Bun workspaces monorepo for the tao-ui design system.

Documentation: [English](https://rickyshin93.github.io/tao-ui/) · [简体中文](https://rickyshin93.github.io/tao-ui/zh/).

Agent access: [guide](https://rickyshin93.github.io/tao-ui/guide/agents) · [JSON discovery index](https://rickyshin93.github.io/tao-ui/agent-manifest.json) · [Markdown index](https://rickyshin93.github.io/tao-ui/llms.txt). The website exposes versioned package facts and bilingual API/example links; the npm package exports `@rockshin/tao-ui/component-manifest.json` and `@rockshin/tao-ui/meta`.

| Package | Name | What it is |
| --- | --- | --- |
| [`packages/tao-ui`](./packages/tao-ui) | `@rockshin/tao-ui` | React 18.2/19 component library: semantic DOM customization, OKLCH theming, Storybook, Rspress docs |
| [`packages/icons`](./packages/icons) | `@rockshin/tao-icons` | 554 rounded-line icons (24px grid, 1.8px stroke) with per-icon entry points, accessible defaults, frozen generation baselines |

`@rockshin/tao-icons` is prepared for publication (MIT metadata, `icons-v` release workflow with npm OIDC provenance) but has **not been published to npm yet**; consume it from this workspace.

## Requirements

- Bun `1.4.x` (workspace install and scripts)
- Node `^20.19.0 || >=22.12.0` (test fixtures, icon consumer checks)
- React 18.2+ or 19 for consumers

## Quick start

```bash
bun install            # install every workspace package from the root lockfile
bun run build          # build both packages
bun run doc            # tao-ui Rspress docs + rslib watch
bun run storybook      # tao-ui Storybook
```

Root scripts delegate to a package with `bun run --filter`; every command can also be run inside `packages/tao-ui` or `packages/icons`.

The bilingual documentation site uses Rspress 2.1. Run `bun run doc --port 4173` for a local preview. The catalog covers 73 visual component entries and the Util type reference, with expandable, copyable examples. Mobile and responsive examples use independent phone/desktop iframe viewports; toast examples are isolated in their own previews. All device previews share a Zustand store and start in phone mode, using the home phone shell and Segmented control. Switching one preview updates every preview and retains the selection across client-side navigation; reloading resets it to phone. Chinese routes use `/zh/components/<component>`; English routes omit `/zh`. Use `bun run doc:build` to verify the static site. The Pages workflow publishes under `/tao-ui/` when `main` changes.

## Package scripts

### @rockshin/tao-ui

```bash
bun run --filter @rockshin/tao-ui build          # rslib build (ESM + d.ts + CSS)
bun run --filter @rockshin/tao-ui test           # rstest, React 18 and React 19 projects
bun run --filter @rockshin/tao-ui lint           # biome
bun run --filter @rockshin/tao-ui typecheck      # tsc --noEmit
bun run --filter @rockshin/tao-ui test:types     # public type contract, React 18 + 19
bun run --filter @rockshin/tao-ui doc:build      # Rspress site
```

### @rockshin/tao-icons

```bash
bun run icons:generate   # regenerate src/icons/*.tsx from data/ canonical geometry
bun run icons:check      # generate drift check + rslib build + tsc + node tests + pack check
bun run icons:verify     # full gate: real tgz consumer checks (React 18/19) and Next fixtures
```

Icon geometry is canonical in `packages/icons/data/` and frozen by SHA-256 baselines. Never hand-edit `packages/icons/src/icons/*.tsx` or `packages/icons/src/index.ts`; run the generator instead.

## Releases

- tao-ui: `bun run release <version>` (bumps, tests, creates the GitHub Release, waits for the release workflow)
- icons: `bun run release:icons` runs the metadata guard; publishing is a separate, explicit decision

## Historical docs

`STATUS.md` tracks work across the monorepo. The tao-ui design and product notes live in `packages/tao-ui/` (`DESIGN.md`, `PRODUCT.md`, `CONTEXT.md`, `docs/`).
