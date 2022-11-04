export type FieldSelector<Values extends object, T> = (values: ObjectSelector<Values, Values>) => Selector<T>;

export function runFieldSelector<Values extends object, T>(values: Values, selectorFn: FieldSelector<Values, T>) {
  return selectorFn(createFormValuesSelector(values));
}

function createFormValuesSelector<Values extends object>(values: Values): ObjectSelector<Values, Values> {
  return createSelectorProxy('', values) as ObjectSelector<Values, Values>;
}

function createSelectorProxy(path: string, value: unknown): Selector<unknown> {
  return new Proxy<Selector<unknown>>(
    {
      [SELECTOR_SYMBOL]: {
        path,
        value,
      },
    },
    {
      get(target, prop /*, receiver */) {
        if (prop === SELECTOR_SYMBOL) {
          return target[SELECTOR_SYMBOL];
        }
        if (typeof prop === 'symbol') {
          throw new Error('Symbol props are not supported');
        }

        const nextValue = value === null || value === undefined ? value : Reflect.get(value, prop);
        return createSelectorProxy(path === '' ? prop : path + `.${prop}`, nextValue);
      },
    }
  );
}

export const SELECTOR_SYMBOL = Symbol.for('ZUSTAND_FORMS_SELECTOR');

export interface SelectorData<Value> {
  path: SelectorPath;
  value: Value;
}

export type SelectorPath = string;

export interface Selector<Value> {
  [SELECTOR_SYMBOL]: SelectorData<Value>;
}

interface ArraySelector<Item, Value> extends Selector<Value> {
  // Add | undefined to all array values because we don't know at compile time the length of the array
  [index: number]: SelectorFor<NonNullable<Item>, Item | undefined | MaybeNull<Value>>;
}

export type ObjectSelector<T, Value> = {
  [K in keyof T]-?: SelectorFor<NonNullable<T[K]>, T[K] | MaybeNull<Value> | MaybeUndefined<Value>>;
} & Selector<Value>;

type SelectorFor<T, Value> = T extends Function
  ? never
  : T extends Array<infer Item>
  ? ArraySelector<Item, Value>
  : T extends object
  ? ObjectSelector<T, Value>
  : Selector<Value>;

type MaybeNull<T> = null extends T ? null : never;
type MaybeUndefined<T> = undefined extends T ? undefined : never;
