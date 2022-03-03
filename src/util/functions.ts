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
