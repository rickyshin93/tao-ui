# Ant Design API compatibility

## Scope

The 0.0.42 expansion uses native tao-ui implementations with Ant Design 6.7.0 public component APIs. The user selected native implementations on 2026-11-04. `antd` is not a runtime dependency. Existing tao-ui APIs remain compatible.

Reference: https://ant.design/changelog/#670 and the official `6.7.0` source tag. The development reference snapshot is `.logs/expansion-0.0.42/reference/ant-design-6.7.0/`; production code must never import from it.

Included entries: Divider, Avatar, Badge, Card, Descriptions, Empty, Segmented, Statistic, Timeline, Progress, Result, Skeleton, List, Listy, Rate, Slider, Tree, TreeSelect, Cascader, Transfer, AutoComplete, Mentions, TimePicker, Calendar, ColorPicker, Upload, Image, Carousel, QRCode, Watermark, Tour, FloatButton, Affix, Masonry, BorderBeam, App and Util (GetProps/GetProp/GetRef type utilities).

Excluded entries: Grid, Layout, Anchor, Menu and Typography. Existing analogous tao-ui components are not renamed. `List` remains included for compatibility despite its upstream deprecation.

## Contract

- Use upstream public prop names, value domains, event payloads, controlled/uncontrolled behavior, refs and documented compound/static APIs. Internal DOM, private hooks and implementation details are not compatibility targets.
- New components use upstream size values where those are public API; inherit the equivalent tao-ui provider size when omitted. Do not change existing tao-ui size values.
- Styles use `--tao-*` tokens and `data-tao-*` state selectors, inherit nested providers, support light/dark/compact themes, and respect reduced motion. Preserve the existing 6px default radius and Semantic DOM customization.
- Every visual component exports its Props and SemanticPart types, `classNames` and `styles`, and a tree-shakeable subpath. Preserve React 18.2 and React 19 support.
- Reuse existing tao-ui components and standard APIs. A maintained low-level primitive can be added when it preserves native styling and is necessary for a complex interaction. Check its current maintenance and explain its purpose before adding it.
- No placeholder implementations, ignored public props, fabricated success, or unconditional fallback results. Any demonstrated incompatibility must be fixed or explicitly remain an incomplete acceptance item.
- Validate behavior through public interfaces: controlled updates, callbacks, keyboard interaction, empty/disabled/loading/error states, semantic styling, refs and nested theme behavior. Confirm CSS and layout in a real browser, not happy-dom.
- Document supported behavior and runnable examples in both languages. API wording may be independently written from upstream facts; copied implementation must preserve the applicable MIT notice.

## Delivery

The execution checklist is `goals/2026-11-04-component-expansion.md`; overall project progress stays in root `STATUS.md`. Complete component, type, package, docs and browser checks before making the GitHub repository public and releasing `@rockshin/tao-ui@0.0.42`. This release does not publish a new tao-icons version.
