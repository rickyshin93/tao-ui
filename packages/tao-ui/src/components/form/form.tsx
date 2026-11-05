import RcForm, {
  FormProvider,
  List,
  type FormProps as RcFormProps,
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
import { type FormInstance, getFieldRegistry, useForm } from './use-form';
import './form.css';
import { interopDefault } from '../../utils/interop-default';

const RcFormComponent = /*#__PURE__*/ interopDefault(RcForm);

export type FormSemanticPart = 'root';

export interface FormProps<Values = Record<string, unknown>>
  extends Omit<RcFormProps<Values>, 'component' | 'form'> {
  form?: FormInstance<Values>;
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
    form,
    ...rcProps
  }: FormProps<Values>,
  ref: React.Ref<FormInstance<Values>>,
) {
  const [instance] = useForm(form);
  const layoutValue = useMemo(
    () => ({
      layout,
      form: instance as FormInstance,
      fields: getFieldRegistry(instance),
    }),
    [layout, instance],
  );
  return (
    <FormLayoutContext.Provider value={layoutValue}>
      {/* size/disabled ride the existing provider cascade — controls inside
          Form.Items pick them up without per-item plumbing. */}
      <TaoProvider size={size} disabled={disabled}>
        <RcFormComponent<Values>
          data-tao-form=""
          ref={ref}
          className={cx(classNames?.root, className)}
          style={{ ...styles?.root, ...style }}
          {...rcProps}
          form={instance}
        >
          {children}
        </RcFormComponent>
      </TaoProvider>
    </FormLayoutContext.Provider>
  );
}

const ForwardedForm = forwardRef(FormInner) as <
  Values = Record<string, unknown>,
>(
  props: FormProps<Values> & { ref?: React.Ref<FormInstance<Values>> },
) => React.ReactElement;

/**
 * Returns the enhanced instance of the enclosing Form.
 */
function useFormInstance<
  Values = Record<string, unknown>,
>(): FormInstance<Values> {
  return useContext(FormLayoutContext).form as FormInstance<Values>;
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
