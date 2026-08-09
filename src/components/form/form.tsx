import RcForm, {
  FieldContext,
  type FormInstance,
  FormProvider,
  List,
  type FormProps as RcFormProps,
  useForm,
  useWatch,
} from '@rc-component/form';
import { forwardRef, type ReactNode, useContext, useMemo } from 'react';
import { TaoProvider, type TaoSize } from '../../provider/tao-provider';
import {
  cx,
  type SemanticClassNames,
  type SemanticStyles,
} from '../../utils/semantic';
import { FormLayoutContext } from './form-context';
import { FormItem, type FormItemProps } from './form-item';
import './form.css';

export type FormSemanticPart = 'root';

export interface FormProps<Values = Record<string, unknown>>
  extends Omit<RcFormProps<Values>, 'component'> {
  /** Label/control arrangement inherited by Form.Item. Defaults to 'vertical'. */
  layout?: 'vertical' | 'horizontal';
  /** Cascades a control size to everything inside the form. */
  size?: TaoSize;
  /** Disables every tao-ui control inside the form (e.g. while submitting). */
  disabled?: boolean;
  children?: ReactNode;
  classNames?: SemanticClassNames<FormSemanticPart>;
  styles?: SemanticStyles<FormSemanticPart>;
}

function FormInner<Values = Record<string, unknown>>(
  {
    layout = 'vertical',
    size,
    disabled,
    children,
    className,
    style,
    classNames,
    styles,
    ...rcProps
  }: FormProps<Values>,
  ref: React.Ref<FormInstance<Values>>,
) {
  // biome-ignore lint/correctness/useHookAtTopLevel: forwardRef render function (generic signature hides it from the rule's component detection)
  const layoutValue = useMemo(() => ({ layout }), [layout]);
  return (
    <FormLayoutContext.Provider value={layoutValue}>
      {/* size/disabled ride the existing provider cascade — controls inside
          Form.Items pick them up without per-item plumbing. */}
      <TaoProvider size={size} disabled={disabled}>
        <RcForm<Values>
          ref={ref}
          className={cx(classNames?.root, className)}
          style={{ ...styles?.root, ...style }}
          {...rcProps}
        >
          {children}
        </RcForm>
      </TaoProvider>
    </FormLayoutContext.Provider>
  );
}

const ForwardedForm = forwardRef(FormInner) as <Values = Record<string, unknown>>(
  props: FormProps<Values> & { ref?: React.Ref<FormInstance<Values>> },
) => React.ReactElement;

/**
 * Returns the instance of the enclosing Form — the rc FieldContext holds the
 * InternalFormInstance (a superset of FormInstance), same source antd's
 * useFormInstance reads from.
 */
function useFormInstance<Values = Record<string, unknown>>(): FormInstance<Values> {
  return useContext(FieldContext) as unknown as FormInstance<Values>;
}

export const Form = Object.assign(ForwardedForm, {
  Item: FormItem,
  List,
  Provider: FormProvider,
  useForm,
  useWatch,
  useFormInstance,
});

export type { FormItemProps };
