export type CompareSelector<T> = (value: T) => string | number;
export type Comparator<T> = (a: T, b: T) => number;

export function by<T>(
  fn: CompareSelector<T>,
  andThen?: Comparator<T>
): Comparator<T> {
  return (a: T, b: T) => {
    const aV = fn(a);
    const bV = fn(b);
    if (aV === bV) {
      return andThen ? andThen(a, b) : 0;
    }
    return aV < bV ? -1 : 1;
  };
}

export function byProp<T, K extends keyof T>(
  prop: K,
  andThen?: Comparator<T>
): Comparator<T> {
  return by<any>((value) => value[prop], andThen);
}

export function inverse<T>(fn: Comparator<T>): Comparator<T> {
  return (a: T, b: T) => {
    return -1 * fn(a, b);
  };
}
