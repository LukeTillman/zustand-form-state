import { runFieldSelector, FieldSelector, SELECTOR_SYMBOL } from '../selector';

interface TestFormValues {
  one: string;
  two: number;
  three: boolean;
  optional?: string;
  optionalObject?: { one: string; two: number };
  array: string[];
  objectArray: Array<{ one: string; two: number }>;
  object: {
    one: string;
    two: number;
    three: boolean;
  };
}

const testValues: TestFormValues = {
  one: '',
  two: 0,
  three: false,
  optional: undefined,
  optionalObject: undefined,
  array: ['first'],
  objectArray: [],
  object: {
    one: '',
    two: 0,
    three: true,
  },
};

type TestCaseArgs = [
  fieldSelector: FieldSelector<TestFormValues, unknown>,
  expectedPath: string,
  expectedValue: unknown
];

describe('selector', () => {
  it.each<TestCaseArgs>([
    [(s) => s.one, 'one', ''],
    [(s) => s.two, 'two', 0],
    [(s) => s.three, 'three', false],
    [(s) => s.optional, 'optional', undefined],
    [(s) => s.optionalObject, 'optionalObject', undefined],
    [(s) => s.optionalObject.two, 'optionalObject.two', undefined],
    [(s) => s.array, 'array', testValues.array],
    [(s) => s.array[0]!, 'array.0', 'first'],
    [(s) => s.array[1]!, 'array.1', undefined],
    [(s) => s.objectArray, 'objectArray', testValues.objectArray],
    [(s) => s.objectArray[3]!.one, 'objectArray.3.one', undefined],
    [(s) => s.object, 'object', testValues.object],
    [(s) => s.object.three, 'object.three', true],
  ])('%s returns path %p and value %p', (...args: TestCaseArgs) => {
    const [fieldSelector, expectedPath, expectedValue] = args;
    const data = runFieldSelector(testValues, fieldSelector)[SELECTOR_SYMBOL];
    expect(data.path).toBe(expectedPath);
    expect(data.value).toBe(expectedValue);
  });
});
