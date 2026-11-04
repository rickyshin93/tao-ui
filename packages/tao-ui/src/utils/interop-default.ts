/** Normalize Babel CommonJS defaults when an ESM consumer resolves a legacy main entry. */
export function interopDefault<T>(module: T): T {
  return (module as { default?: T }).default ?? module;
}
