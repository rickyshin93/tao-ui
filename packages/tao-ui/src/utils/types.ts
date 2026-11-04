import type { Component, Context, JSXElementConstructor, Ref } from 'react';

/** Infer component props, a context value, or retain a props object. */
export type GetProps<T extends object> =
  T extends Context<infer Value>
    ? Value
    : T extends JSXElementConstructor<infer Props>
      ? Props
      : T;

/** Read a non-nullable prop, or the return value of a function prop. */
export type GetProp<
  T extends object,
  PropName extends keyof GetProps<T>,
  Type extends 'Default' | 'Return' = 'Default',
> = Type extends 'Return'
  ? ReturnType<
      Extract<NonNullable<GetProps<T>[PropName]>, (...args: never[]) => unknown>
    >
  : NonNullable<GetProps<T>[PropName]>;

/** Infer the public instance accepted by a component's ref. */
export type GetRef<T extends object> = T extends Component
  ? T
  : 'ref' extends keyof GetProps<T>
    ? NonNullable<GetProps<T>['ref']> extends Ref<infer Instance> | string
      ? Instance
      : never
    : never;
