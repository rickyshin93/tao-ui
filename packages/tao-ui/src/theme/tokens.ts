export type TaoTokenName =
  | '--tao-border-text-weight'
  | '--tao-box-shadow'
  | '--tao-box-shadow-secondary'
  | '--tao-box-shadow-tertiary'
  | '--tao-box-shadow-xs'
  | '--tao-color-bg-base'
  | '--tao-color-bg-container'
  | '--tao-color-bg-container-disabled'
  | '--tao-color-bg-disabled'
  | '--tao-color-bg-elevated'
  | '--tao-color-bg-layout'
  | '--tao-color-bg-mask'
  | '--tao-color-bg-surface'
  | '--tao-color-bg-text-active'
  | '--tao-color-bg-text-hover'
  | '--tao-color-border'
  | '--tao-color-border-secondary'
  | '--tao-color-error'
  | '--tao-color-error-outline'
  | '--tao-color-fill'
  | '--tao-color-fill-quaternary'
  | '--tao-color-fill-secondary'
  | '--tao-color-fill-tertiary'
  | '--tao-color-primary'
  | '--tao-color-shadow-hint'
  | '--tao-color-split'
  | '--tao-color-success'
  | '--tao-color-text'
  | '--tao-color-text-base'
  | '--tao-color-text-description'
  | '--tao-color-text-disabled'
  | '--tao-color-text-heading'
  | '--tao-color-text-label'
  | '--tao-color-text-light-solid'
  | '--tao-color-text-placeholder'
  | '--tao-color-text-quaternary'
  | '--tao-color-text-secondary'
  | '--tao-color-text-tertiary'
  | '--tao-color-warning'
  | '--tao-color-warning-outline'
  | '--tao-control-height'
  | '--tao-control-height-lg'
  | '--tao-control-height-sm'
  | '--tao-control-item-bg-active'
  | '--tao-control-item-bg-active-hover'
  | '--tao-control-item-bg-hover'
  | '--tao-control-outline'
  | '--tao-control-padding-horizontal'
  | '--tao-control-padding-horizontal-sm'
  | '--tao-control-range-width'
  | '--tao-control-width'
  | '--tao-drop-shadow-popover'
  | '--tao-error'
  | '--tao-error-active'
  | '--tao-error-bg'
  | '--tao-error-border'
  | '--tao-error-fg'
  | '--tao-error-hover'
  | '--tao-font-family'
  | '--tao-font-family-code'
  | '--tao-font-size'
  | '--tao-font-size-base'
  | '--tao-font-size-lg'
  | '--tao-font-size-sm'
  | '--tao-font-size-xl'
  | '--tao-font-size-xs'
  | '--tao-font-weight-medium'
  | '--tao-font-weight-normal'
  | '--tao-font-weight-strong'
  | '--tao-line-height'
  | '--tao-line-height-lg'
  | '--tao-line-height-sm'
  | '--tao-line-width'
  | '--tao-line-width-bold'
  | '--tao-margin'
  | '--tao-margin-lg'
  | '--tao-margin-md'
  | '--tao-margin-sm'
  | '--tao-margin-xl'
  | '--tao-margin-xs'
  | '--tao-margin-xxl'
  | '--tao-margin-xxs'
  | '--tao-motion-duration-fast'
  | '--tao-motion-duration-mid'
  | '--tao-motion-duration-slow'
  | '--tao-motion-ease-in-out'
  | '--tao-motion-ease-out'
  | '--tao-motion-ease-out-expo'
  | '--tao-motion-ease-out-quint'
  | '--tao-motion-unit'
  | '--tao-opacity-loading'
  | '--tao-padding'
  | '--tao-padding-lg'
  | '--tao-padding-md'
  | '--tao-padding-sm'
  | '--tao-padding-xl'
  | '--tao-padding-xs'
  | '--tao-padding-xxs'
  | '--tao-primary'
  | '--tao-primary-active'
  | '--tao-primary-bg'
  | '--tao-primary-bg-hover'
  | '--tao-primary-border'
  | '--tao-primary-fg'
  | '--tao-primary-hover'
  | '--tao-radius'
  | '--tao-radius-2xl'
  | '--tao-radius-full'
  | '--tao-radius-lg'
  | '--tao-radius-md'
  | '--tao-radius-sm'
  | '--tao-radius-xl'
  | '--tao-radius-xs'
  | '--tao-ring-width'
  | '--tao-size'
  | '--tao-size-lg'
  | '--tao-size-md'
  | '--tao-size-ms'
  | '--tao-size-sm'
  | '--tao-size-step'
  | '--tao-size-unit'
  | '--tao-size-xl'
  | '--tao-size-xs'
  | '--tao-size-xxl'
  | '--tao-size-xxs'
  | '--tao-success'
  | '--tao-success-bg'
  | '--tao-success-border'
  | '--tao-warning'
  | '--tao-warning-bg'
  | '--tao-warning-border'
  | '--tao-z-index-base'
  | '--tao-z-index-drawer'
  | '--tao-z-index-modal'
  | '--tao-z-index-popup'
  | '--tao-z-index-popup-base';

export function tokenVar(name: TaoTokenName | (string & {})): string {
  return `var(${name})`;
}

export const taoTokenNames = [
  '--tao-border-text-weight',
  '--tao-box-shadow',
  '--tao-box-shadow-secondary',
  '--tao-box-shadow-tertiary',
  '--tao-box-shadow-xs',
  '--tao-color-bg-base',
  '--tao-color-bg-container',
  '--tao-color-bg-container-disabled',
  '--tao-color-bg-disabled',
  '--tao-color-bg-elevated',
  '--tao-color-bg-layout',
  '--tao-color-bg-mask',
  '--tao-color-bg-surface',
  '--tao-color-bg-text-active',
  '--tao-color-bg-text-hover',
  '--tao-color-border',
  '--tao-color-border-secondary',
  '--tao-color-error',
  '--tao-color-error-outline',
  '--tao-color-fill',
  '--tao-color-fill-quaternary',
  '--tao-color-fill-secondary',
  '--tao-color-fill-tertiary',
  '--tao-color-primary',
  '--tao-color-shadow-hint',
  '--tao-color-split',
  '--tao-color-success',
  '--tao-color-text',
  '--tao-color-text-base',
  '--tao-color-text-description',
  '--tao-color-text-disabled',
  '--tao-color-text-heading',
  '--tao-color-text-label',
  '--tao-color-text-light-solid',
  '--tao-color-text-placeholder',
  '--tao-color-text-quaternary',
  '--tao-color-text-secondary',
  '--tao-color-text-tertiary',
  '--tao-color-warning',
  '--tao-color-warning-outline',
  '--tao-control-height',
  '--tao-control-height-lg',
  '--tao-control-height-sm',
  '--tao-control-item-bg-active',
  '--tao-control-item-bg-active-hover',
  '--tao-control-item-bg-hover',
  '--tao-control-outline',
  '--tao-control-padding-horizontal',
  '--tao-control-padding-horizontal-sm',
  '--tao-control-range-width',
  '--tao-control-width',
  '--tao-drop-shadow-popover',
  '--tao-error',
  '--tao-error-active',
  '--tao-error-bg',
  '--tao-error-border',
  '--tao-error-fg',
  '--tao-error-hover',
  '--tao-font-family',
  '--tao-font-family-code',
  '--tao-font-size',
  '--tao-font-size-base',
  '--tao-font-size-lg',
  '--tao-font-size-sm',
  '--tao-font-size-xl',
  '--tao-font-size-xs',
  '--tao-font-weight-medium',
  '--tao-font-weight-normal',
  '--tao-font-weight-strong',
  '--tao-line-height',
  '--tao-line-height-lg',
  '--tao-line-height-sm',
  '--tao-line-width',
  '--tao-line-width-bold',
  '--tao-margin',
  '--tao-margin-lg',
  '--tao-margin-md',
  '--tao-margin-sm',
  '--tao-margin-xl',
  '--tao-margin-xs',
  '--tao-margin-xxl',
  '--tao-margin-xxs',
  '--tao-motion-duration-fast',
  '--tao-motion-duration-mid',
  '--tao-motion-duration-slow',
  '--tao-motion-ease-in-out',
  '--tao-motion-ease-out',
  '--tao-motion-ease-out-expo',
  '--tao-motion-ease-out-quint',
  '--tao-motion-unit',
  '--tao-opacity-loading',
  '--tao-padding',
  '--tao-padding-lg',
  '--tao-padding-md',
  '--tao-padding-sm',
  '--tao-padding-xl',
  '--tao-padding-xs',
  '--tao-padding-xxs',
  '--tao-primary',
  '--tao-primary-active',
  '--tao-primary-bg',
  '--tao-primary-bg-hover',
  '--tao-primary-border',
  '--tao-primary-fg',
  '--tao-primary-hover',
  '--tao-radius',
  '--tao-radius-2xl',
  '--tao-radius-full',
  '--tao-radius-lg',
  '--tao-radius-md',
  '--tao-radius-sm',
  '--tao-radius-xl',
  '--tao-radius-xs',
  '--tao-ring-width',
  '--tao-size',
  '--tao-size-lg',
  '--tao-size-md',
  '--tao-size-ms',
  '--tao-size-sm',
  '--tao-size-step',
  '--tao-size-unit',
  '--tao-size-xl',
  '--tao-size-xs',
  '--tao-size-xxl',
  '--tao-size-xxs',
  '--tao-success',
  '--tao-success-bg',
  '--tao-success-border',
  '--tao-warning',
  '--tao-warning-bg',
  '--tao-warning-border',
  '--tao-z-index-base',
  '--tao-z-index-drawer',
  '--tao-z-index-modal',
  '--tao-z-index-popup',
  '--tao-z-index-popup-base',
] as const satisfies readonly TaoTokenName[];

export const taoTokenVars = Object.fromEntries(
  taoTokenNames.map((name) => [name, tokenVar(name)]),
) as Record<TaoTokenName, string>;
