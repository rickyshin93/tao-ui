import { Field, type Meta, type NamePath, type Rule } from '@rc-component/form';
import {
  type CSSProperties,
  cloneElement,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { TaoStatus } from '../../provider/tao-provider';
import type { SemanticClassNames, SemanticStyles } from '../../utils/semantic';
import { FormFieldView } from '../form-field/form-field-view';
import { FieldControl } from './field-control';
import { useFormLayout } from './form-context';
import type { FormInstance } from './use-form';

export type FormItemSemanticPart = 'root' | 'label' | 'error' | 'description';

export type FormItemValidateStatus = TaoStatus;

export type FormItemChildren<Values = Record<string, unknown>> =
  | ReactNode
  | ((
      control: Record<string, unknown>,
      meta: Meta,
      form: FormInstance<Values>,
    ) => ReactNode);

export interface FormItemProps<Values = Record<string, unknown>> {
  name?: NamePath<Values>;
  label?: ReactNode;
  /** Required mark; also inferred from `rules` entries with `required: true`. */
  required?: boolean;
  rules?: Rule[];
  /**
   * Manual message. Overrides the rule error when provided; shown in the
   * error slot while a status is active, otherwise in the description slot.
   */
  help?: ReactNode;
  /** Extra description rendered below the control (antd `extra`). */
  extra?: ReactNode;
  /** Manual status override; derived from rule errors when omitted. */
  validateStatus?: FormItemValidateStatus;
  initialValue?: unknown;
  /** Prop carrying the control value, e.g. `checked` for Switch. */
  valuePropName?: string;
  getValueFromEvent?: (...args: unknown[]) => unknown;
  /** Child prop that triggers value collection. Defaults to 'onChange'. */
  trigger?: string;
  validateTrigger?: string | string[] | false;
  /** Render the bound control without the label/message shell. */
  noStyle?: boolean;
  dependencies?: NamePath<Values>[];
  shouldUpdate?:
    | boolean
    | ((
        prevValues: Values,
        nextValues: Values,
        info: { source?: string },
      ) => boolean);
  normalize?: (
    value: unknown,
    prevValue: unknown,
    allValues: Record<string, unknown>,
  ) => unknown;
  preserve?: boolean;
  messageVariables?: Record<string, string>;
  validateFirst?: boolean | 'parallel';
  htmlFor?: string;
  className?: string;
  style?: CSSProperties;
  classNames?: SemanticClassNames<FormItemSemanticPart>;
  styles?: SemanticStyles<FormItemSemanticPart>;
  children?: FormItemChildren<Values>;
}

/**
 * antd-aligned form field: binds a control to the form store via rc `Field`
 * (value/trigger injection, rules validation, meta), rendered with the same
 * shell as FormField (label / required mark / error / description).
 *
 * With no `name`, `dependencies`, or `shouldUpdate`, it is purely
 * presentational — equivalent to FormField with `help`/`validateStatus`.
 */
export function FormItem<Values = Record<string, unknown>>({
  name,
  label,
  required,
  rules,
  help,
  extra,
  validateStatus,
  initialValue,
  valuePropName,
  getValueFromEvent,
  trigger,
  validateTrigger,
  noStyle,
  dependencies,
  shouldUpdate,
  normalize,
  preserve,
  messageVariables,
  validateFirst,
  htmlFor,
  className,
  style,
  classNames,
  styles,
  children,
}: FormItemProps<Values>): ReactNode {
  const { layout, form: formInstance } = useFormLayout();

  const renderShell = (
    content: ReactNode,
    meta: Meta | undefined,
    control: Record<string, unknown> | null,
  ) => {
    const requiredMark =
      required ??
      rules?.some((rule) =>
        typeof rule === 'function'
          ? !!(formInstance && rule(formInstance).required)
          : !!rule?.required,
      ) ??
      false;
    const status: FormItemValidateStatus | undefined =
      validateStatus ??
      (meta?.errors.length
        ? 'error'
        : meta?.warnings.length
          ? 'warning'
          : undefined);
    const message = help ?? meta?.errors[0] ?? meta?.warnings[0];
    const showAsStatus = message != null && status != null;
    const errorSlot = showAsStatus ? message : undefined;
    const descriptionSlot = !showAsStatus ? message : undefined;

    // Push the status into custom (non-host) controls that expose
    // status/error props (tao Input/Select/…); host elements would warn on
    // the unknown DOM attribute.
    let controlProps = control ?? undefined;
    const valueProp = valuePropName ?? 'value';
    const element =
      isValidElement<Record<string, unknown>>(content) &&
      content.type !== Fragment
        ? content
        : undefined;
    if (
      status &&
      element &&
      typeof element.type !== 'string' &&
      element.props.status == null &&
      element.props.error == null
    ) {
      controlProps = { ...controlProps, status };
    }
    if (
      controlProps &&
      valuePropName === 'checked' &&
      'checked' in controlProps &&
      (controlProps.checked === undefined ||
        (controlProps.checked === null && element?.type === 'input'))
    ) {
      controlProps = { ...controlProps, checked: false };
    }
    // Native controls need a concrete empty value to remain controlled.
    if (controlProps && valueProp === 'value' && controlProps.value == null) {
      if (element?.type === 'select') {
        controlProps = {
          ...controlProps,
          value: element.props.multiple ? [] : '',
        };
      } else if (element?.type === 'input' || element?.type === 'textarea') {
        controlProps = { ...controlProps, value: '' };
      }
    }
    // The rc Field render function supplies collection and validation handlers
    // without the direct child's handlers. Render-prop consumers already receive
    // these handlers and can compose them explicitly.
    if (controlProps && element) {
      for (const [prop, handler] of Object.entries(controlProps)) {
        const childHandler = element.props[prop];
        if (
          prop !== valueProp &&
          typeof handler === 'function' &&
          typeof childHandler === 'function'
        ) {
          controlProps = {
            ...controlProps,
            [prop]:
              typeof children === 'function'
                ? childHandler
                : (...args: unknown[]) => {
                    handler(...args);
                    childHandler(...args);
                  },
          };
        }
      }
    }
    const collect = control?.onChange;
    const valueChange =
      (trigger ?? 'onChange') === 'onChange' &&
      valueProp === 'value' &&
      typeof collect === 'function'
        ? {
            onChange: controlProps?.onChange,
            collect: (value: unknown) => collect(value),
          }
        : null;

    if (noStyle) {
      if (!element) return content;
      const child = controlProps
        ? cloneElement(element, controlProps)
        : element;
      return name != null && meta ? (
        <FieldControl name={meta.name} valueChange={valueChange}>
          {child}
        </FieldControl>
      ) : (
        child
      );
    }

    return (
      <FormFieldView
        formItem
        reserveMessage={
          Boolean(rules?.length) ||
          help != null ||
          extra != null ||
          validateStatus != null
        }
        label={label}
        htmlFor={htmlFor}
        required={requiredMark}
        error={errorSlot}
        invalid={status === 'error'}
        warning={status === 'warning'}
        description={descriptionSlot}
        extra={extra}
        layout={layout}
        controlProps={controlProps}
        renderControl={
          name != null && meta
            ? (child: ReactElement<Record<string, unknown>>) => (
                <FieldControl name={meta.name} valueChange={valueChange}>
                  {child}
                </FieldControl>
              )
            : undefined
        }
        className={className}
        style={style}
        classNames={classNames}
        styles={styles}
      >
        {content}
      </FormFieldView>
    );
  };

  // Purely presentational — no binding requested.
  if (name == null && dependencies == null && shouldUpdate == null) {
    return renderShell(children as ReactNode, undefined, null);
  }

  return (
    <Field
      name={name ?? undefined}
      rules={rules}
      initialValue={initialValue}
      valuePropName={valuePropName}
      getValueFromEvent={getValueFromEvent}
      trigger={trigger}
      validateTrigger={validateTrigger}
      dependencies={dependencies}
      shouldUpdate={shouldUpdate}
      normalize={normalize}
      preserve={preserve}
      messageVariables={messageVariables}
      validateFirst={validateFirst}
    >
      {(control, meta) => {
        const content =
          typeof children === 'function'
            ? children(control, meta, formInstance as FormInstance<Values>)
            : children;
        // Only named fields bind value/trigger onto the control.
        return renderShell(content, meta, name != null ? control : null);
      }}
    </Field>
  );
}
