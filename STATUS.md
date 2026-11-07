# STATUS

## Doing
- none

## Next

- decide whether tao-ui components adopt `@rockshin/tao-icons` for app-level glyphs
- refine animation/stacking behavior if more feedback patterns are added

## Backlog
- none

## Done
- 2026-11-07 Consolidated component fixes since 0.0.48 and synchronized the English and Chinese 0.0.49 changelogs and component guidance.
- 2026-11-07 Published tao-icons 0.1.1 with 213 refined SVGs and deployed the bilingual catalog with 2,067 entries and searchable aliases. Verified the public npm archive, CI, Pages and both locales in Chrome.
- 2026-11-07 Published tao-icons 0.1.0 (2,165 MIT-licensed icons) and deployed the bilingual catalog with 39 groups and six React examples. npm archive, Pages and local browser checks passed.
- 2026-11-06 Released `@rockshin/tao-ui@0.0.48`: 24px Form feedback spacing with stable single-line validation and unchanged font size. Project gates, Release/CI/Pages, npm integrity and local ai-portal desktop/mobile/RTL acceptance passed; generated release outputs cleaned. See `.logs/release-0.0.48/verification.md`.
- 2026-11-06 Released `@rockshin/tao-ui@0.0.47`: Form feedback colors/compact spacing, Cascader mobile improvements and docs styling, integrated with RTL/locales from 0.0.45–46. Project gates, Release/CI/Pages, npm tarball integrity and local ai-portal acceptance passed. See `.logs/release-0.0.47/verification.md`.
- 2026-11-06 Fixed Form subpath error/required styles and compacted feedback spacing; fields without validation/messages no longer reserve an empty line. Required gates and local Chrome desktop/mobile/RTL/dark/horizontal consumer checks passed; released in 0.0.47. See `.logs/form-feedback-20261106/verification.md`.
- 2026-11-06 Released `@rockshin/tao-ui@0.0.46`: 17 locale packs, localized dates/numbers and component messages, plus vector logo and bilingual website update. Project/CI/release/Pages gates, live browser checks and fresh-cache npm React 18/19 consumer checks passed.
- 2026-11-06 Released `@rockshin/tao-ui@0.0.45` with complete RTL direction/interaction fixes and the React 18 Segmented crash fix. Review, project gates, Release/CI/Pages and real npm React 18/19 consumer/browser checks passed; bilingual docs deployed. Icons unchanged. See `.logs/rtl-0.0.45/verification.md`.
- 2026-11-05 Released `@rockshin/tao-ui@0.0.44` (Form.scrollToField, optional focus, nested/List/noStyle fields and bilingual examples) to npm latest and deployed docs. Release/CI/Pages and real npm React 18/19 consumer/browser checks passed. See `.logs/release-0.0.44/verification.md`.
- 2026-11-05 Aligned Cascader with Select: hover clear/suffix switching and mobile bottom Drawer with search, single commit, multiple Done/cancel and keyboard navigation. React 18/19, package/docs gates and local Chrome touch/docs previews passed; released in 0.0.47. See `.logs/cascader-mobile-20261105/verification.md`.
- 2026-11-05 Centered Cascader expansion arrows in popup and inline panel rows. Required package gates and local Chrome desktop/390px LTR/RTL alignment and selection checks passed; released in 0.0.47. See `.logs/cascader-alignment-20261105/verification.md`.
- 2026-11-05 Unified docs styling with the home specimen: site-wide paper/ink tokens (guide no longer teal), jade accent (hue 170, clear of success green) on navigation/links, numbered examples on dotted jade specimen paper, borderless neutral inline code, two-column examples whose card tops align per pair (subgrid, natural card heights); home seed rotation now starts with jade (replacing teal). Lint, typecheck, docs build/check and local Chrome desktop/390px/dark checks passed; deployed with 0.0.47.
- 2026-11-05 Fixed the Chinese Agent top-nav duplicate locale prefix (with generated-page link validation) and added GitHub About description/topics; deployed. See `.logs/agent-nav-20261105/verification.md`.
- 2026-11-05 Released `@rockshin/tao-ui@0.0.43` and deployed the bilingual site: Motion specimen home, component references aligned to it, Collapse (replacing Collapsible), Input family APIs, many component fixes (Form.Item feedback line, Calendar/Steps/Carousel/Switch/Modal/RadioGroup etc.), SEO/GEO/Agent discovery; React 18/19 npm consumers verified. See `.logs/release-0.0.43/verification.md`.
- 2026-11-05 Released `@rockshin/tao-ui@0.0.42` (37 native catalog entries, bilingual runnable examples), made the repo public, deployed Pages and complete Chinese sidebar labels.
- 2026-11-04 Released 0.0.41 (Select scrolling); expanded bilingual examples with phone/desktop iframe previews, responsive review fixes (`RESPONSIVE.md`), 6px default radius, Input/Switch/Textarea fixes, Rspress 2.1.0.
- 2026-10-28–10-30 Released 0.0.40; completed field/picker/overlay/selection ARIA semantics (real screen-reader validation outstanding).
- 2026-10-15–10-20 Monorepo (bun workspaces, tao-icons 0.0.1 staged pending 2FA), Rslib 1.0, TypeScript 7; Table sticky header/expandable/summary and oklab colour mixing; Select clear hit area.
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
- Review 2026-11-05: ColorPicker rewrites typed Hex values and loses achromatic HSB hue; Upload default picture preview is inert; App modal updates remount action buttons and lose focus. Reproduced on React 18/19; fixes pending. See `.logs/component-review-20261105/review.md`.
- Responsive controls: real iOS Safari/Android devices, software keyboards, safe areas and screen readers remain unverified; local Chrome emulation passed.
- Select numeric popup widths retain the trigger's minimum width; the docs demonstrate a wider popup and explain this constraint.
