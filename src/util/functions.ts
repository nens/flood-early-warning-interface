export function withDefault<T>(value: T | null | undefined, defaultValue: string | T): T | string {
  if (value === null || value === undefined) {
    return defaultValue;
  } else {
    return value;
  }
}

type ValueFunc<T> = (a: T) => number;

export function arrayMax<T>(array: T[], valueFunc: ValueFunc<T>): number {
  // Returns *index* of max element according to valueFunc
  // Return -1 if array empty
  // If multiple indices reach the max, returns the first
  // If valueFunc thinks an index should be skipped, return -Inf for that index

  let indexOfMax = -1;
  let valueOfMax = -Infinity;

  for (let i = 0; i < array.length; i++) {
    const value = valueFunc(array[i]);
    if (valueOfMax < valueFunc(array[i])) {
      indexOfMax = i;
      valueOfMax = value;
    }
  }
  return indexOfMax;
}

export function arrayMin<T>(array: T[], valueFunc: ValueFunc<T>): number {
  return arrayMax(array, (a) => -valueFunc(a));
}

export function dashOrNum(value: number | string | null | undefined): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }

  return value !== null && value !== undefined ? value.toFixed(2) : "-";
}

// Array utils
export const swap = <T>(arr: T[], idx0: number, idx1: number): T[] =>
  arr.map((a: T, idx) => (idx === idx0 ? arr[idx1] : idx === idx1 ? arr[idx0] : a));

export const moveUp = <T>(arr: T[], idx: number): T[] => (idx > 0 ? swap(arr, idx, idx - 1) : arr);
export const moveDown = <T>(arr: T[], idx: number): T[] =>
  idx < arr.length - 1 ? swap(arr, idx, idx + 1) : arr;

export const change = <T>(arr: T[], idx: number, a: T): T[] =>
  arr
    .slice(0, idx)
    .concat([a])
    .concat(arr.slice(idx + 1));

export const remove = <T>(arr: T[], idx: number): T[] =>
  arr.slice(0, idx).concat(arr.slice(idx + 1));
