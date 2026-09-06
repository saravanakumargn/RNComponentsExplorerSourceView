const GITHUB_RAW_SOURCE_BASE =
  'https://raw.githubusercontent.com/saravanakumargn/RNComponentsExplorerSourceView/master/v7';

const sourceCache = new Map<string, string>();

function remotePathFor(path: string): string {
  return path.startsWith('features/') ? path.slice('features/'.length) : path;
}

export function sourceUrlFor(path: string): string {
  const encodedPath = remotePathFor(path)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${GITHUB_RAW_SOURCE_BASE}/${encodedPath}`;
}

export async function fetchSourceContent(path: string, signal?: AbortSignal): Promise<string> {
  const cached = sourceCache.get(path);
  if (cached !== undefined) return cached;

  const response = await fetch(sourceUrlFor(path), {
    headers: { Accept: 'text/plain' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`GitHub returned HTTP ${response.status}`);
  }

  const content = await response.text();
  sourceCache.set(path, content);
  return content;
}
