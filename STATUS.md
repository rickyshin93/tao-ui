# STATUS

## Doing
- align Sonner stacking state machine more closely with reference behavior

## Next
- refine animation/stacking behavior if more feedback patterns are added

## Backlog
- none

## Done
- 2026-08-04 center Input text and password discs independently without shifting password selection
- 2026-08-04 optically center native Input text and password discs across the control height
- 2026-08-04 clip Input autofill paint to rounded controls and preserve autofill text metrics
- 2026-08-03 keep Select option padding inside popup width so selected checks remain visible
- 2026-08-03 align Button icon sizing and text spacing with antd
- 2026-08-02 ship typed Semantic DOM contracts for all visual components and enforce docs/source parity
- 2026-08-02 harden a11y/SSR/public types, split Select/Table internals, enforce strict CI gates, and clean package metadata
- 2026-07-26 align Drawer/Modal mask closing with Antd: only real overlay clicks close; nested portals stay interactive
- 2026-07-25 support React SVG Input prefixes with automatic overlay positioning and reserved padding
- 2026-07-25 make desktop RangePicker editable and inline-search multiple/tags Select
- 2026-07-25 make desktop single Select with `showSearch` an editable combobox trigger
- 2026-07-25 enable strict manual date entry for desktop DatePicker while preserving mobile Drawer trigger
- 2026-07-25 tighten Input prefix gap to 4px and left-align RangePicker content
- 2026-07-21 Modal top offset 100px → component token `--tao-modal-offset-top`; provider stories add Dark Mode demo
- 2026-07-21 dark mode: pure-CSS `[data-tao-theme="dark"]` algorithm (4 seeds + flipped derived), `theme.mode` on TaoProvider, portal propagation, Storybook toolbar toggle
- 2026-07-21 eliminate all hardcoded color escapes (Table/Tag/Modal/Drawer/ScrollArea/mobile-select → tokens: bg-surface, text-light-solid, bg-mask, shadow-hint); regression test pins zero literals
- 2026-07-21 sync DESIGN.md to implementation (radius 10, height 32, border 12%, ring 3px, motion-ease-out-expo token); README adds Dark mode + Fonts sections
- 2026-07-21 fonts: follow antd (no bundled fonts), fallback stack upgraded with CJK; Storybook devDeps @fontsource/geist-{sans,mono}
- 2026-07-12 add Button `icon`/`loadingIcon` props with mount-stable icon slot to kill loading flicker
- 2026-07-12 rework Sonner stack layout with front height compression and frozen removal offsets
- 2026-07-12 use measured toast heights for Sonner expanded stack offsets
- 2026-07-12 add Sonner enter/exit motion and stacked toast scale/lift behavior
- 2026-07-12 fix Sonner toast close button vertical centering and clickable size
- 2026-07-12 add Sonner toast component with imperative `toast()` API, story, docs, tests

## Known issues
- none
