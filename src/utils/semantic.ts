import type { CSSProperties } from 'react';

/**
 * Semantic DOM type utilities.
 * Each component defines its own SemanticPart union and uses these
 * generic types for the classNames / styles props.
 */

export type SemanticClassNames<T extends string> = Partial<Record<T, string>>;
export type SemanticStyles<T extends string> = Partial<Record<T, CSSProperties>>;

/** Join class names, filtering out falsy values. */
export function cx(...classes: (string | undefined | false | null)[]): string | undefined {
  const result = classes.filter(Boolean).join(' ');
  return result || undefined;
}
