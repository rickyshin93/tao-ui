# STATUS

## Doing
- none

## Next

- add an icon gallery to the Rspress docs (generated from `packages/icons/data/manifest.json`) and decide whether tao-ui components adopt `@rockshin/tao-icons` for app-level glyphs
- publish `@rockshin/tao-icons` only after the owner confirms the license/public scope and the 224 generic candidates are design-confirmed
- refine animation/stacking behavior if more feedback patterns are added

## Backlog
- none

## Done
- 2026-10-20 Rslib 1.0: tao-ui `@rslib/core` 0.23.2 → `^1.0.3` (same major line as the icons package); build output identical in size (197 files / 792.7 kB), declarations now use `.js` extension redirects, Rslib v1 ESM externals/`import.meta` defaults verified; full gate re-run green (typecheck, both type-test projects, 1840 tests, Rspress + Storybook builds, exports/CSS check, pack) (unreleased)
- 2026-10-20 Monorepo: bun workspaces (`packages/tao-ui` + `packages/icons`), icons renamed `@rockshin/tao-icons@0.0.1` MIT with `^18.2.0 || ^19.0.0` peer, single root lockfile, Rspress/Storybook/Pack/type gates moved under `packages/tao-ui`, CI split into per-package jobs, icon release workflow prepared (bootstrap token; provenance blocked while repo private); both packages build and their gates pass (unreleased)
- 2026-10-18 Theme/Table/Tag/Steps/control: colored×neutral tints (primary/status -bg/-border, tag fills incl. custom color, row hover) mix in oklab — oklch hue drift collapsed them to beige/peach (blue hover ≈ header, selected rows & tag fills beige); hover 4%→6%, table row divider 5%→7% (≈antd) (unreleased)
- 2026-10-16 Select: enlarge allowClear hit area (::before, 16px→~32×28) so near misses no longer open the popup and hide the clear button (unreleased)
- 2026-10-15 Table: light primary-tinted row hover, opaque row states under fixed columns, stronger unbroken fixed-edge shadows that track container resize (unreleased)
- 2026-10-15 Table: add scroll.y sticky header, antd-style expandable rows, and summary footer (Table.Summary, fixed); opaque pinned headers, loading mask covers whole table (unreleased)
- 2026-10-12 drop Popover's popup+30 stacking so Select/Menu/DatePicker popups opened inside a Popover paint above it (unreleased)
- 2026-10-05 release v0.0.36 with deeper Table data view and Select selection modules; preserve public behavior and React 18/19 support, complete two review rounds
- 2026-09-07 suppress blank tags popups when empty content is disabled; preserve tag entry, suffix icons, and custom popup content
- 2026-09-06 fix numeric/search/Splitter updates, uncontrolled Table selection, date preset constraints and range month synchronization, Popover focus retention and cleared Form boolean fields
- 2026-09-06 optimize large-table selection; fix checkbox/tabs/field accessibility, mobile/IME/date input, textarea resizing and dialog lifecycles
- 2026-09-06 fix selection, pagination, async lifecycle and form warning issues, including empty searchable multi-select text inset; add component imports that reduce Button CSS by 85%
- 2026-09-06 support React 18.2/19 with dual-version checks; fix overlays, controlled values, Table selection, refs, drag/scroll and release preflight
- 2026-09-01 keep fixed Table headers on the active variant background and add antd-style shadows at fixed-column edges
- 2026-08-09–2026-08-28 ship bilingual Rspress documentation and interactive examples, add Pages CI, and refresh design guidance (Pages hosting blocked; see Known issues)
- 2026-08-09–2026-08-28 align Popover behavior, harden picker/Select/Sonner lifecycles, and improve Button/Input/Textarea styling and customization
- 2026-08 rollup: strengthen accessibility, SSR, public types and CI checks; standardize Semantic DOM and tokens; refine Input and Select layout
- 2026-07 rollup: ship Sonner, dark mode and provider themes; improve editable pickers, searchable Select, and nested overlay behavior; align control layout and design documentation

## Known issues
- GitHub Pages deployment is blocked while the repository is private on the current account plan; make it public or upgrade the plan before enabling Pages
