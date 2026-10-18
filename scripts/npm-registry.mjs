// Read the published version straight from the registry packument instead of
// `npm view`: the npm CLI can keep handing back its cached copy long after the
// release lands, which once made a successful release look like a failure.
export function packumentUrl(packageName, registry) {
  const base = (registry ?? 'https://registry.npmjs.org/').replace(/\/$/, '');
  return `${base}/${packageName.replace('/', '%2F')}`;
}

/**
 * Returns the registry's `latest` dist-tag once `version` is part of the
 * packument, or `undefined` while the upload is still being processed.
 * Rejects on an unreachable registry so callers can decide to keep polling.
 */
export async function fetchPublishedVersion(packageName, version, registry) {
  const response = await fetch(packumentUrl(packageName, registry), {
    headers: { accept: 'application/json', 'cache-control': 'no-cache' },
    cache: 'no-store',
  });
  if (response.status === 404) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error(`Registry responded with ${response.status}`);
  }
  const packument = await response.json();
  return packument.versions?.[version]
    ? packument['dist-tags']?.latest
    : undefined;
}
