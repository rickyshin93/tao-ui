# STATUS

## Doing
- 2026-11-04 Select scrolling fixed for `@rockshin/tao-ui@0.0.41`; local/browser/CI validation passed; tag/GitHub Release created. After token replacement, npm rejects direct publishing with E403 E_STAGE_REQUIRED: the new token is stage-only (run 41810854171, attempt 2). Publication pending a compatible publishing route.
- 2026-10-20 Approve the staged `@rockshin/tao-icons@0.0.1` on npmjs.com: the registry currently shows the public `0.0.0-stage` placeholder, and the real version needs maintainer 2FA approval (Staged Packages -> Approve)

## Next

- add an icon gallery to the Rspress docs (generated from `packages/icons/data/manifest.json`) and decide whether tao-ui components adopt `@rockshin/tao-icons` for app-level glyphs
- publish `@rockshin/tao-icons` only after the owner confirms the license/public scope and the 224 generic candidates are design-confirmed
- refine animation/stacking behavior if more feedback patterns are added

## Backlog
- none

## Done
- 2026-10-30 Released `@rockshin/tao-ui@0.0.40`; local and GitHub release checks passed and the version is available on npm.
- 2026-10-28 ARIA: complete field, picker, overlay and selection semantics; fix reviewed native-label, required/disabled, range-draft and keyboard-focus regressions. Project gates, docs build, browser smoke and follow-up review pass; real screen-reader validation remains outside this local verification.
- 2026-10-20 Deps: TypeScript 7.0.2 in both packages (root TS 6.0.3 pin for Rspress docgen, `typescript-compiler` alias for the component sync check), plugin-babel 2.1.0, jest-dom 7.0.1, @types/node 26.6.5, rsbuild 2.2.14/rstest 0.12.4; icons devDependencies now share the tao-ui ranges; happy-dom stays 20.13.2 (21.x computed-style regression)
- 2026-10-20 Release @rockshin/tao-icons@0.0.1: GitHub Release `icons-v0.0.1` published via release-icons.yml; npm staged the new package (0.0.0-stage placeholder) pending 2FA approval (unreleased)
- 2026-10-20 Rslib 1.0: tao-ui `@rslib/core` 0.23.2 → `^1.0.3` (same major line as the icons package); build output identical in size (197 files / 792.7 kB), declarations now use `.js` extension redirects, Rslib v1 ESM externals/`import.meta` defaults verified; full gate re-run green (typecheck, both type-test projects, 1840 tests, Rspress + Storybook builds, exports/CSS check, pack)
- 2026-10-20 Monorepo: bun workspaces (`packages/tao-ui` + `packages/icons`), icons renamed `@rockshin/tao-icons@0.0.1` MIT with `^18.2.0 || ^19.0.0` peer, single root lockfile, Rspress/Storybook/Pack/type gates moved under `packages/tao-ui`, CI split into per-package jobs, icon release workflow prepared (bootstrap token; provenance blocked while repo private); both packages build and their gates pass
- 2026-10-18 Theme/Table/Tag/Steps/control: colored×neutral tints (primary/status -bg/-border, tag fills incl. custom color, row hover) mix in oklab — oklch hue drift collapsed them to beige/peach (blue hover ≈ header, selected rows & tag fills beige); hover 4%→6%, table row divider 5%→7% (≈antd)
- 2026-10-16 Select: enlarge allowClear hit area (::before, 16px→~32×28) so near misses no longer open the popup and hide the clear button
- 2026-10-15 Table: light primary-tinted row hover, opaque row states under fixed columns, stronger unbroken fixed-edge shadows that track container resize
- 2026-10-15 Table: add scroll.y sticky header, antd-style expandable rows, and summary footer (Table.Summary, fixed); opaque pinned headers, loading mask covers whole table
- 2026-10-12 drop Popover's popup+30 stacking so Select/Menu/DatePicker popups opened inside a Popover paint above it
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
