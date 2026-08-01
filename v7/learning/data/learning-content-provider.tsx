import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import type { PropsWithChildren } from 'react';

import { createLearningContentRepository, type LearningContentRepository } from './learning-content-repository';

export const LEARNING_CONTENT_SCHEMA_VERSION = 1;
export const LEARNING_CONTENT_VERSION = '1.0.0';

type MetadataRepository = Pick<LearningContentRepository, 'getMetadata'>;

export async function assertLearningContentMetadata(
  database: SQLiteDatabase,
  repository: MetadataRepository = createLearningContentRepository(database),
): Promise<void> {
  const metadata = await repository.getMetadata();
  if (!metadata) throw new Error('Learning content metadata is missing.');
  if (metadata.schemaVersion !== LEARNING_CONTENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported learning content schema version ${metadata.schemaVersion}.`);
  }
  if (metadata.contentVersion !== LEARNING_CONTENT_VERSION) {
    throw new Error(`Unsupported learning content version ${metadata.contentVersion}.`);
  }
}

/**
 * The content DB is immutable. Overwriting the copied asset at startup ensures
 * an app release with a new bundled version cannot leave stale content behind;
 * user progress is isolated in learning-progress.db and is unaffected.
 */
export function LearningContentProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider
      databaseName="learning-content.db"
      assetSource={{
        assetId: require('@/assets/learning/learning-content.db'),
        forceOverwrite: true,
      }}
      onInit={assertLearningContentMetadata}
    >
      {children}
    </SQLiteProvider>
  );
}
