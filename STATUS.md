# STATUS

## Doing
- 2026-10-20 Approve the staged `@rockshin/tao-icons@0.0.1` on npmjs.com: the registry currently shows the public `0.0.0-stage` placeholder, and the real version needs maintainer 2FA approval (Staged Packages -> Approve)

## Next

- add an icon gallery to the Rspress docs (generated from `packages/icons/data/manifest.json`) and decide whether tao-ui components adopt `@rockshin/tao-icons` for app-level glyphs
- publish `@rockshin/tao-icons` only after the owner confirms the license/public scope and the 224 generic candidates are design-confirmed
- refine animation/stacking behavior if more feedback patterns are added

## Backlog
- none

## Done
- 2026-11-05 Deployed complete Chinese component sidebar labels; all 74 entries, desktop/mobile navigation, long-label wrapping and local/CI gates passed.
- 2026-11-05 Released `@rockshin/tao-ui@0.0.42`: added 37 native catalog entries, completed bilingual runnable examples, made the repository public and deployed Pages. Local/CI/browser gates and real npm React18/19 consumers passed.
- 2026-11-04 Expanded all 37 bilingual component references with runnable, copyable examples; added phone/desktop iframe previews and isolated notifications. Select examples and size-matched popup typography are accepted. Project gates, production/dev previews and desktop/mobile browser checks passed; deployment remains deferred.
- 2026-11-04 Unified medium Input/Textarea default horizontal padding at 8px, including medium Input affix spacing; project gates, docs build and local desktop/390px browser checks passed with stable text positions across focus.
- 2026-11-04 Fixed clipped Textarea focus rings in Rspress previews by reserving space inside the preview scroller; project gates, docs build and local desktop/390px browser checks passed.
- 2026-11-04 Fixed responsive review items 1–6: mobile Select behavior/drafts, responsive tags, narrow layouts, touch targets, customization and configurable English/Chinese text. Project gates and local Chrome viewport/touch checks passed; see `packages/tao-ui/RESPONSIVE.md` for contract and device-validation scope.
- 2026-11-04 Changed the global default border radius to 6px, including theme reset defaults and design documentation; project gates, theme inheritance/reset and local browser checks passed, docs preview rebuilt.
- 2026-11-04 Fixed Switch label/handle overlap and loading-icon alignment across sizes, custom widths and RTL; bilingual examples now use balanced SVG state icons. Project gates and local desktop/mobile browser checks passed, production docs preview rebuilt.
- 2026-11-04 Upgraded Rspress and official plugins to 2.1.0; completed bilingual home, Button and Select local website previews with interactive examples and code copying. Project gates, production browser checks and independent review passed; deployment deferred.
- 2026-11-04 Released `@rockshin/tao-ui@0.0.41` fixing Select option-list scrolling; local/browser/CI checks passed, npm latest and downloaded package contents verified after publishing token replacement.
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
- Responsive controls: real iOS Safari/Android devices, software keyboards, safe areas and screen readers remain unverified; local Chrome emulation passed.
- Select numeric popup widths retain the trigger's minimum width; the docs demonstrate a wider popup and explain this constraint.
