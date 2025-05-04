export function takeUnique<T>(arr: T[]): T {
  return arr[0] as T;
}
export function takeUniqueOrNull<T>(arr: T[]): T | null {
  return arr[0] ?? null;
}
