import { mkdir } from 'node:fs/promises';

// npm pack --pack-destination does not create a missing destination itself.
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
