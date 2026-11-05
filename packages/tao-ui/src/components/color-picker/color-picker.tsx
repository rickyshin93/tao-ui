import * as Popover from '@radix-ui/react-popover';
import RcColorPicker, { Color as BaseColor } from '@rc-component/color-picker';
import {
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { TaoPortalScope, useTaoConfig } from '../../provider/tao-provider';
import { cx } from '../../utils/semantic';
import { Button } from '../button/button';
import { Collapse } from '../collapse/collapse';
import { BaseInput as Input } from '../input/base-input';
import { Segmented } from '../segmented/segmented';
import { Select } from '../select/select';
import { Slider } from '../slider/slider';
import { Color, type ColorFormatType, type ModeType } from './color';
import type { ColorPickerProps } from './color-picker-types';
import './color-picker.css';
import { interopDefault } from '../../utils/interop-default';

const RcColorPickerComponent = /*#__PURE__*/ interopDefault(RcColorPicker);

export type {
  Color,
  ColorFormatType,
  ColorGenInput,
  ColorValueType,
  GradientColor,
  LineGradientType,
  ModeType,
} from './color';
export type * from './color-picker-types';

interface PanelState {
  props: ColorPickerProps;
  value: Color;
  active: number;
  setActive: (index: number) => void;
  format: ColorFormatType;
  setFormat: (format: ColorFormatType) => void;
  mode: ModeType;
  modes: ModeType[];
  setMode: (mode: ModeType) => void;
  change: (value: Color, complete?: boolean) => void;
  complete: (value: Color) => void;
  clear: () => void;
  chinese: boolean;
}
const PanelContext = createContext<PanelState>(null!);
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

function colorKeys() {
  const counts = new Map<string, number>();
  return (value: string) => {
    const occurrence = counts.get(value) ?? 0;
    counts.set(value, occurrence + 1);
    return `${value}:${occurrence}`;
  };
}

function PickerPanel() {
  const fieldId = useId();
  const keyForColor = colorKeys();
  const panel = useContext(PanelContext);
  const {
    value,
    active,
    props,
    mode,
    modes,
    setMode,
    format,
    setFormat,
    chinese,
  } = panel;
  const stops = value.getColors(),
    activeIndex = Math.min(active, stops.length - 1);
  const selected = mode === 'gradient' ? stops[activeIndex].color : value;
  const hex = selected.toHexString();
  const [draft, setDraft] = useState(hex);
  useEffect(() => setDraft(hex), [hex]);
  const replace = (next: Color) =>
    mode === 'gradient'
      ? new Color(
          stops.map((stop, index) => ({
            ...stop,
            color: index === activeIndex ? next : stop.color,
          })),
        )
      : next;
  const changeSelected = (next: Color, complete = true) =>
    panel.change(replace(next), complete);
  const numberInput = (
    label: string,
    number: number,
    max: number,
    change: (value: number) => void,
    step = 1,
  ) => (
    <label data-tao-color-field="" htmlFor={`${fieldId}-${label}`}>
      <span>{label}</span>
      <Input
        id={`${fieldId}-${label}`}
        size="small"
        disabled={false}
        type="number"
        aria-label={label}
        min={0}
        max={max}
        step={step}
        value={number}
        onChange={(event) => {
          if (event.target.value !== '')
            change(clamp(Number(event.target.value), max));
        }}
      />
    </label>
  );
  const rgb = selected.toRgb(),
    hsb = selected.toHsb();
  const prefix = props.prefixCls ?? 'tao-color-engine';
  return (
    <div data-tao-color-picker-controls="">
      {modes.length > 1 && (
        <Segmented<ModeType>
          aria-label={chinese ? '颜色模式' : 'Color mode'}
          size="small"
          disabled={false}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'single', label: chinese ? '单色' : 'Single' },
            { value: 'gradient', label: chinese ? '渐变' : 'Gradient' },
          ]}
        />
      )}
      {mode === 'gradient' && (
        <div data-tao-color-stops="">
          <div
            data-tao-color-gradient=""
            style={{ background: value.toCssString() }}
          />
          <div data-tao-color-stop-list="">
            {stops.map((stop, index) => (
              <button
                key={keyForColor(`${stop.percent}:${stop.color.toCssString()}`)}
                type="button"
                aria-label={`${chinese ? '色标' : 'Color stop'} ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => panel.setActive(index)}
                style={{ background: stop.color.toCssString() }}
              />
            ))}
            <Button
              variant="bare"
              disabled={false}
              type="button"
              aria-label={chinese ? '添加色标' : 'Add color stop'}
              onClick={() => {
                const added = { color: selected, percent: 50 };
                const next = [...stops, added].sort(
                  (a, b) => a.percent - b.percent,
                );
                panel.setActive(next.indexOf(added));
                panel.change(new Color(next));
              }}
            >
              +
            </Button>
            {stops.length > 2 && (
              <Button
                variant="bare"
                disabled={false}
                type="button"
                aria-label={chinese ? '删除色标' : 'Remove color stop'}
                onClick={() => {
                  panel.setActive(Math.max(0, activeIndex - 1));
                  panel.change(
                    new Color(
                      stops.filter((_, index) => index !== activeIndex),
                    ),
                  );
                }}
              >
                −
              </Button>
            )}
          </div>
          <div data-tao-color-stop-position="">
            <span>{chinese ? '位置' : 'Position'}</span>
            <Slider
              ariaLabelForHandle={chinese ? '色标位置' : 'Stop position'}
              disabled={false}
              min={0}
              max={100}
              value={stops[activeIndex].percent}
              tooltip={{ open: false }}
              onChange={(percent) => {
                const moved = {
                  ...stops[activeIndex],
                  percent,
                };
                const next = stops
                  .map((stop, index) => (index === activeIndex ? moved : stop))
                  .sort((a, b) => a.percent - b.percent);
                panel.setActive(next.indexOf(moved));
                panel.change(new Color(next), false);
              }}
              onChangeComplete={() => panel.complete(value)}
            />
            <span>{stops[activeIndex].percent}%</span>
          </div>
        </div>
      )}
      <RcColorPickerComponent
        prefixCls={prefix}
        value={new BaseColor(selected.toRgb())}
        disabledAlpha={props.disabledAlpha}
        onChange={(next) => changeSelected(new Color(next.toRgb()), false)}
        onChangeComplete={(next) =>
          panel.complete(replace(new Color(next.toRgb())))
        }
      />
      <div data-tao-color-inputs="">
        <Select
          aria-label={chinese ? '颜色格式' : 'Color format'}
          mobileTitle={chinese ? '颜色格式' : 'Color format'}
          size="small"
          style={{ width: '5.5em', flexShrink: 0 }}
          styles={{
            popup: { zIndex: 'calc(var(--tao-z-index-popup-base) + 60)' },
          }}
          value={format}
          disabled={props.disabledFormat ?? false}
          onChange={(next) => setFormat(next as ColorFormatType)}
          options={['hex', 'rgb', 'hsb'].map((item) => ({
            value: item,
            label: item.toUpperCase(),
          }))}
        />
        {format === 'hex' ? (
          <Input
            size="small"
            disabled={false}
            aria-label={chinese ? '十六进制颜色' : 'Hex color'}
            value={draft}
            aria-invalid={
              !/^#?(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(
                draft,
              )
            }
            onChange={(event) => {
              setDraft(event.target.value);
              if (
                /^#?(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(
                  event.target.value,
                )
              )
                changeSelected(
                  new Color(`#${event.target.value.replace(/^#/, '')}`),
                );
            }}
          />
        ) : format === 'rgb' ? (
          <>
            {numberInput('Red', rgb.r, 255, (r) =>
              changeSelected(new Color({ ...rgb, r })),
            )}
            {numberInput('Green', rgb.g, 255, (g) =>
              changeSelected(new Color({ ...rgb, g })),
            )}
            {numberInput('Blue', rgb.b, 255, (b) =>
              changeSelected(new Color({ ...rgb, b })),
            )}
          </>
        ) : (
          <>
            {numberInput('Hue', Math.round(hsb.h), 360, (h) =>
              changeSelected(new Color({ ...hsb, h })),
            )}
            {numberInput('Saturation', Math.round(hsb.s * 100), 100, (s) =>
              changeSelected(new Color({ ...hsb, s: s / 100 })),
            )}
            {numberInput('Brightness', Math.round(hsb.b * 100), 100, (b) =>
              changeSelected(new Color({ ...hsb, b: b / 100 })),
            )}
          </>
        )}
        {!props.disabledAlpha &&
          numberInput('Alpha', Math.round(rgb.a * 100), 100, (alpha) =>
            changeSelected(new Color({ ...rgb, a: alpha / 100 })),
          )}
      </div>
      {props.allowClear && (
        <Button
          variant="ghost"
          size="small"
          disabled={false}
          data-tao-color-clear=""
          onClick={panel.clear}
        >
          {chinese ? '清除颜色' : 'Clear color'}
        </Button>
      )}
    </div>
  );
}
function PresetsPanel() {
  const keyForColor = colorKeys();
  const { props, change, chinese } = useContext(PanelContext);
  if (!props.presets?.length) return null;
  return (
    <div data-tao-color-presets="">
      <Collapse
        ghost
        disabled={false}
        size="small"
        defaultActiveKey={props.presets.flatMap((preset, index) =>
          (preset.defaultOpen ?? true) ? [String(preset.key ?? index)] : [],
        )}
        items={props.presets.map((preset, index) => ({
          key: String(preset.key ?? index),
          label: preset.label,
          children: (
            <div data-tao-color-swatches="">
              {preset.colors.map((value) => {
                const color = new Color(value);
                return (
                  <button
                    key={keyForColor(color.toCssString())}
                    type="button"
                    aria-label={`${chinese ? '预设' : 'Preset'} ${color.isGradient() ? color.toCssString() : color.toHexString()}`}
                    style={{ background: color.toCssString() }}
                    onClick={() => change(color)}
                  />
                );
              })}
            </div>
          ),
        }))}
      />
    </div>
  );
}
function opaque(value: Color) {
  return value.isGradient()
    ? new Color(
        value.getColors().map((stop) => ({
          ...stop,
          color: new Color({ ...stop.color.toRgb(), a: 1 }),
        })),
      )
    : new Color({ ...value.toRgb(), a: 1 });
}

export function ColorPicker(props: ColorPickerProps) {
  const config = useTaoConfig();
  const [innerValue, setValue] = useState<Color>(
    () =>
      new Color(
        props.defaultValue === undefined ? '#1677ff' : props.defaultValue,
      ),
  );
  const [innerOpen, setOpen] = useState(false),
    [innerFormat, setFormat] = useState<ColorFormatType>(
      props.defaultFormat ?? 'hex',
    );
  const [active, setActive] = useState(0),
    [triggerElement, setTriggerElement] = useState<HTMLSpanElement | null>(
      null,
    );
  const [innerMode, setMode] = useState<ModeType>(() =>
    new Color(props.value ?? props.defaultValue).isGradient()
      ? 'gradient'
      : ((Array.isArray(props.mode) ? props.mode[0] : props.mode) ?? 'single'),
  );
  const cachedGradient = useRef<Color | null>(null),
    hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const configuredModes = props.mode
    ? Array.isArray(props.mode)
      ? props.mode
      : [props.mode]
    : ['single' as const];
  const modes = configuredModes.length ? configuredModes : ['single' as const];
  const mode = modes.includes(innerMode) ? innerMode : modes[0];
  const rawColor =
    props.value === undefined ? innerValue : new Color(props.value);
  const isGradient = rawColor.isGradient();
  useEffect(() => {
    setMode(isGradient ? 'gradient' : 'single');
  }, [isGradient]);
  const value =
    mode === 'gradient' && !rawColor.isGradient() && !rawColor.cleared
      ? new Color([
          { color: rawColor, percent: 0 },
          { color: rawColor, percent: 100 },
        ])
      : rawColor;
  const panelValue =
    mode === 'gradient' && value.cleared
      ? new Color([
          { color: 'transparent', percent: 0 },
          { color: 'transparent', percent: 100 },
        ])
      : value;
  const format = props.format ?? innerFormat,
    disabled = props.disabled ?? config.disabled;
  const open = !disabled && (props.open ?? innerOpen);
  const names =
    typeof props.classNames === 'function'
      ? props.classNames({ props })
      : props.classNames;
  const styles =
    typeof props.styles === 'function' ? props.styles({ props }) : props.styles;
  const chinese = config.locale.locale === 'zh_CN';
  const normalize = (next: Color) =>
    props.disabledAlpha && !next.cleared ? opaque(next) : next;
  const complete = (next: Color) => props.onChangeComplete?.(normalize(next));
  const change = (next: Color, finished = true) => {
    const color = normalize(next);
    if (props.value === undefined) setValue(color);
    cachedGradient.current = null;
    props.onChange?.(color, color.toCssString());
    if (finished) complete(color);
  };
  const openChange = (next: boolean) => {
    if (next && disabled) return;
    if (props.open === undefined) setOpen(next);
    props.onOpenChange?.(next);
  };
  const enter = () => {
    clearTimeout(hoverTimer.current);
    if (props.trigger === 'hover') openChange(true);
  };
  const leave = () => {
    if (props.trigger === 'hover')
      hoverTimer.current = setTimeout(() => openChange(false), 100);
  };
  const panelState: PanelState = {
    props,
    value: panelValue,
    active,
    setActive,
    format,
    setFormat: (next) => {
      if (props.format === undefined) setFormat(next);
      if (format !== next) props.onFormatChange?.(next);
    },
    mode,
    modes,
    setMode: (next) => {
      setMode(next);
      setActive(0);
      const cached = value.isGradient() ? value : cachedGradient.current;
      change(
        next === 'single'
          ? value.getColors()[0].color
          : (cached ??
              new Color([
                { color: value, percent: 0 },
                { color: value, percent: 100 },
              ])),
      );
      cachedGradient.current = cached;
    },
    change,
    complete,
    clear: () => {
      change(new Color(null));
      props.onClear?.();
    },
    chinese,
  };
  const basicPanel = (
    <>
      <PickerPanel />
      <PresetsPanel />
    </>
  );
  const placement = props.placement ?? 'bottomLeft';
  const side = placement.startsWith('top')
    ? 'top'
    : placement.startsWith('left')
      ? 'left'
      : placement.startsWith('right')
        ? 'right'
        : 'bottom';
  const align =
    typeof props.arrow === 'object' && props.arrow.pointAtCenter
      ? 'center'
      : /Left|Top/.test(placement)
        ? 'start'
        : /Right|Bottom/.test(placement)
          ? 'end'
          : 'center';
  const text =
    typeof props.showText === 'function'
      ? props.showText(value)
      : value.cleared
        ? chinese
          ? '透明'
          : 'Transparent'
        : value.isGradient()
          ? chinese
            ? '渐变'
            : 'Gradient'
          : format === 'rgb'
            ? value.toRgbString()
            : format === 'hsb'
              ? value.toHsbString()
              : value.toHexString();
  const dataProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => key.startsWith('data-')),
  );
  const defaultTrigger = (
    <button
      type="button"
      disabled={disabled}
      aria-label={`${chinese ? '选择颜色' : 'Choose color'} ${value.toHexString()}`}
    >
      <span data-tao-color-body="" className={names?.body} style={styles?.body}>
        <span
          data-tao-color-content=""
          className={names?.content}
          style={{ background: value.toCssString(), ...styles?.content }}
        />
      </span>
      {props.showText && (
        <span
          data-tao-color-description=""
          className={names?.description}
          style={styles?.description}
        >
          {text}
        </span>
      )}
    </button>
  );
  return (
    <span
      ref={setTriggerElement}
      data-tao-color-picker=""
      data-tao-size={
        props.size === 'middle' ? 'medium' : (props.size ?? config.size)
      }
      data-disabled={disabled || undefined}
      className={cx(names?.root, props.className, props.rootClassName)}
      style={{ ...styles?.root, ...props.style }}
      {...dataProps}
    >
      <Popover.Root open={open} onOpenChange={openChange}>
        <Popover.Trigger
          asChild
          onPointerEnter={enter}
          onPointerLeave={leave}
          onClick={(event) => {
            if (props.trigger === 'hover' || disabled) event.preventDefault();
          }}
        >
          {isValidElement(props.children) ? (
            props.children
          ) : props.children ? (
            <button type="button" disabled={disabled}>
              {props.children}
            </button>
          ) : (
            defaultTrigger
          )}
        </Popover.Trigger>
        <Popover.Portal
          container={
            triggerElement
              ? props.getPopupContainer?.(triggerElement)
              : undefined
          }
          forceMount={
            props.destroyOnHidden || props.destroyTooltipOnHide
              ? undefined
              : true
          }
        >
          <TaoPortalScope asChild>
            <Popover.Content
              data-tao-color-popup=""
              aria-label={chinese ? '颜色选择器' : 'Color picker'}
              side={side}
              align={align}
              sideOffset={6}
              collisionPadding={12}
              avoidCollisions={props.autoAdjustOverflow ?? true}
              onPointerEnter={enter}
              onPointerLeave={leave}
              className={names?.popup?.root}
              style={{
                ...styles?.popup?.root,
                ...(open ? {} : { display: 'none' }),
              }}
              onOpenAutoFocus={(event) => {
                if (props.trigger === 'hover') event.preventDefault();
              }}
            >
              <div
                data-tao-color-container=""
                className={names?.popup?.container}
                style={{
                  ...styles?.popupOverlayInner,
                  ...styles?.popup?.container,
                }}
              >
                <PanelContext.Provider value={panelState}>
                  {props.panelRender
                    ? props.panelRender(basicPanel, {
                        components: {
                          Picker: PickerPanel,
                          Presets: PresetsPanel,
                        },
                      })
                    : basicPanel}
                </PanelContext.Provider>
              </div>
              {props.arrow !== false && (
                <Popover.Arrow data-tao-color-arrow="" />
              )}
            </Popover.Content>
          </TaoPortalScope>
        </Popover.Portal>
      </Popover.Root>
    </span>
  );
}
