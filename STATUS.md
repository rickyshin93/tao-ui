# STATUS

## Doing
- align Sonner stacking state machine more closely with reference behavior

## Next

- refine animation/stacking behavior if more feedback patterns are added

## Backlog
- none

## Done
- 2026-08-09 add GitHub Pages CI: Rspress builds on every PR and deploys `doc_build` after pushes to `main`
- 2026-08-09 restore interactive Rspress DatePicker, Radio, Checkbox, Select, and number-input demos without changing component borders or behavior
- 2026-08-09 internationalize all 76 Rspress pages in English and Chinese, including navigation, search, API headings, descriptions, and per-locale llms outputs
- 2026-08-09 publish categorized Rspress pages with 118 runnable examples, descriptions, and API tables for all 36 public components
- 2026-08-09 expand Button docs with runnable sizes, states, icons, provider, and semantic customization examples
- 2026-08-09 restore left-aligned Rspress API table headers and cells
- 2026-08-09 replace separate install snippets with Rspress PackageManagerTabs for npm, yarn, pnpm, bun, and deno
- 2026-08-09 expand the Rspress home with six source-backed advantages, stronger AI-native positioning, and a solid ink-teal light/dark theme
- 2026-08-09 rebuild docs from Rspress v2 defaults: native home, auto nav/sidebar, Button Preview/API, responsive layout, and llms output
- 2026-08-09 ship the AI-native homepage with animated Agent Runtime, seven evidence-backed advantage cards, editable Playgrounds, and left-aligned docs tables
- 2026-08-09 ship the Rspress website vertical slice with branded home, Getting Started, Button demos/API, dark mode, search, and llms output
- 2026-08-09 upgrade Rspress core and official docs plugins from 2.0.13 to 2.0.19 and validate the docs build
- 2026-08-09 remove Storybook's global padded canvas and give Popover placements collision-safe test space
- 2026-08-09 align Popover API, geometry, triggers, placements, arrow, shadow, and motion with local antd v6
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
- 2026-08-09 eliminate all hardcoded color escapes (including Dropdown/Tooltip arrows → shadow-hint); regression test pins zero literals
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
