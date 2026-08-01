const values = new Map<string, boolean | string>();

// The vendored demo was written for the pre-v4 `new MMKV()` API. The Expo host
// already uses MMKV v4, so Metro routes only upstream demo imports here while
// keeping the demo's storage source unchanged.
export class MMKV {
  contains(key: string) {
    return values.has(key);
  }

  getBoolean(key: string) {
    const value = values.get(key);

    return typeof value === 'boolean' ? value : undefined;
  }

  getString(key: string) {
    const value = values.get(key);

    return typeof value === 'string' ? value : undefined;
  }

  set(key: string, value: boolean | string) {
    values.set(key, value);
  }
}
