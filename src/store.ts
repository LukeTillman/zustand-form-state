import { createStore } from 'zustand';
import { FieldSelector, SelectorPath, SELECTOR_SYMBOL, runFieldSelector } from './selector';
import lodashSet from 'lodash.set';
import { produce } from 'immer';
import { ValidationOptions, ValidationState } from './validation';

export interface FormStore<Values extends object> {
  values: Values;
  touched: Record<SelectorPath, boolean | undefined>;
  errors: ValidationState;

  getFieldValue<T>(field: FieldSelector<Values, T>): T;
  setFieldValue<T>(field: FieldSelector<Values, T>, value: T): void;

  getFieldTouched(field: FieldSelector<Values, unknown>): boolean;
  setFieldTouched(field: FieldSelector<Values, unknown>, isTouched: boolean): void;

  getFieldError(field: FieldSelector<Values, unknown>): string | undefined;
  setFieldError(field: FieldSelector<Values, unknown>, error?: string): void;

  reset(): void;
}

export interface FormStoreOptions<Values extends object> {
  initialValues: Values;
  initialTouched?: FormStore<Values>['touched'];
  initialErrors?: ValidationState;
  validation?: ValidationOptions<Values>;
}

export function createFormStore<Values extends object>({
  initialValues,
  initialTouched = {},
  initialErrors = {},
  validation,
}: FormStoreOptions<Values>) {
  return createStore<FormStore<Values>>((set, get) => ({
    values: initialValues,
    touched: initialTouched,
    errors: initialErrors,

    getFieldValue(field) {
      const { values } = get();
      const data = runFieldSelector(values, field)[SELECTOR_SYMBOL];
      return data.value;
    },

    setFieldValue(field, value) {
      set((state) => {
        const { path } = runFieldSelector(state.values, field)[SELECTOR_SYMBOL];

        const values = produce(state.values, (draft) => {
          lodashSet(draft, path, value);
        });

        // Validate new values on change if configured
        let errors = state.errors;
        if (validation?.when === 'change' || validation?.when === 'both') {
          errors = validation.adapter.validate(values);
        }

        return {
          values,
          errors,
        };
      });
    },

    getFieldTouched(field) {
      const { values, touched } = get();
      const data = runFieldSelector(values, field)[SELECTOR_SYMBOL];
      return touched[data.path] ?? false;
    },

    setFieldTouched(field, isTouched) {
      set((state) => {
        const { path } = runFieldSelector(state.values, field)[SELECTOR_SYMBOL];

        // Validate on blur if configured
        let errors = state.errors;
        if (isTouched && (validation?.when === 'blur' || validation?.when === 'both')) {
          errors = validation.adapter.validate(state.values);
        }

        return {
          touched: {
            ...state.touched,
            [path]: isTouched,
          },
          errors,
        };
      });
    },

    getFieldError(field) {
      const { values, errors } = get();
      const data = runFieldSelector(values, field)[SELECTOR_SYMBOL];
      return errors[data.path];
    },

    setFieldError(field, error?) {
      set((state) => {
        const { path } = runFieldSelector(state.values, field)[SELECTOR_SYMBOL];
        return {
          errors: {
            ...state.errors,
            [path]: error,
          },
        };
      });
    },

    reset() {
      set({ values: initialValues, touched: initialTouched, errors: initialErrors });
    },
  }));
}
