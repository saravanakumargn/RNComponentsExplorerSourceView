import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-sqlite', () => ({ SQLiteProvider: () => null }));

import { assertLearningContentMetadata, LEARNING_CONTENT_SCHEMA_VERSION, LEARNING_CONTENT_VERSION } from './learning-content-provider';

describe('assertLearningContentMetadata', () => {
  it('accepts the bundled content schema and version', async () => {
    const database = {} as never;
    const getMetadata = vi.fn().mockResolvedValue({
      schemaVersion: LEARNING_CONTENT_SCHEMA_VERSION,
      contentVersion: LEARNING_CONTENT_VERSION,
      createdAt: '2026-07-28T00:00:00.000Z',
      sourceHash: 'a'.repeat(64),
    });

    await expect(assertLearningContentMetadata(database, { getMetadata })).resolves.toBeUndefined();
  });

  it.each([
    ['missing metadata', null, /metadata is missing/],
    ['wrong schema', { schemaVersion: 1, contentVersion: LEARNING_CONTENT_VERSION }, /schema version 1/],
    ['wrong content version', { schemaVersion: LEARNING_CONTENT_SCHEMA_VERSION, contentVersion: '0.9.0' }, /content version 0.9.0/],
  ])('rejects %s', async (_name, metadata, expectedError) => {
    const database = {} as never;
    const getMetadata = vi.fn().mockResolvedValue(metadata);

    await expect(assertLearningContentMetadata(database, { getMetadata })).rejects.toThrow(expectedError);
  });
});
