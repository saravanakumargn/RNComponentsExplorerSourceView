import 'expo-sqlite/localStorage/install';

import { useEffect, useState } from 'react';

const DIRECTORY_API_URL = 'https://reactnative.directory/api/library';
const CACHE_PREFIX = 'rn-component-explorer:directory-library:';
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type DirectoryLibrary = {
  githubUrl?: string;
  npmPkg?: string;
  github?: {
    urls?: {
      homepage?: string;
      repo?: string;
    };
    stats?: {
      issues?: number;
      pushedAt?: string;
      stars?: number;
    };
    license?: {
      spdxId?: string;
    };
  };
  npm?: {
    latestRelease?: string;
    weekDownloads?: number;
  };
};

type CachedDirectoryLibrary = {
  data: DirectoryLibrary;
  fetchedAt: number;
};

function cacheKey(packageName: string) {
  return `${CACHE_PREFIX}${packageName}`;
}

function readCachedLibrary(packageName: string) {
  try {
    const value = localStorage.getItem(cacheKey(packageName));
    return value ? (JSON.parse(value) as CachedDirectoryLibrary) : undefined;
  } catch {
    return undefined;
  }
}

function cacheLibrary(packageName: string, data: DirectoryLibrary) {
  try {
    localStorage.setItem(cacheKey(packageName), JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch {
    // Storage is an optional optimization; live data can still load without it.
  }
}

/**
 * Fetches the React Native Directory's already-aggregated metadata rather than
 * calling GitHub from every device. Cached values are shown immediately and
 * refreshed at most once every six hours.
 */
export function useReactNativeDirectoryLibrary(packageName: string | undefined) {
  const [library, setLibrary] = useState<DirectoryLibrary | undefined>(() =>
    packageName ? readCachedLibrary(packageName)?.data : undefined
  );

  useEffect(() => {
    if (!packageName) {
      setLibrary(undefined);
      return;
    }

    // Bound to a local so the narrowing survives into refreshLibrary's closure.
    const name = packageName;
    const cached = readCachedLibrary(name);
    if (cached) {
      setLibrary(cached.data);
    }

    if (cached && Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
      return;
    }

    const controller = new AbortController();

    async function refreshLibrary() {
      try {
        const response = await fetch(
          `${DIRECTORY_API_URL}?name=${encodeURIComponent(name)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`React Native Directory request failed: ${response.status}`);
        }

        const result = (await response.json()) as Record<string, DirectoryLibrary>;
        const data = result[name];

        if (!data) {
          return;
        }

        cacheLibrary(name, data);
        setLibrary(data);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          // A cached value, when present, remains visible if the service is unavailable.
        }
      }
    }

    void refreshLibrary();
    return () => controller.abort();
  }, [packageName]);

  return library;
}
