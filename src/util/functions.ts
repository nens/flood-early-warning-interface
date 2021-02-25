export function withDefault<T>(value: T | null | undefined, defaultValue: string | T): T | string {
  if (value === null || value === undefined) {
    return defaultValue;
  } else {
    return value;
  }
}
