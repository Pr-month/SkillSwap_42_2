export const getRange = (start: number, end: number, step = 1): number[] => {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};

export function excludeElementFromArray<T>(list: T[], element: T): T[] {
  return list.filter((elem) => elem !== element);
}

export function addElementInArray<T>(list: T[], element: T): T[] {
  return list.includes(element) ? list : [...list, element];
}
