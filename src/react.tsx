import { createContext, useContext } from 'react';
import { StoreApi, useStore } from 'zustand';
import { FormStore } from './store';
import { FieldSelector } from './selector';

export interface ReactBindings<Values extends object> {
  FormStoreContext: React.Context<StoreApi<FormStore<Values>> | undefined>;
  FormStoreProvider: React.ComponentType<FormStoreProviderProps<Values>>;
  useFormStoreContext(): StoreApi<FormStore<Values>>;
  useFormStore<T>(selectorFn: (state: FormStore<Values>) => T, equalityFn?: (a: T, b: T) => boolean): T;
  useFieldValue<T>(field: FieldSelector<Values, T>): FieldStateTuple<T>;
  useFieldTouched(field: FieldSelector<Values, unknown>): FieldStateTuple<boolean>;
  useFieldError(field: FieldSelector<Values, unknown>): FieldStateTuple<string | undefined>;
  useField<T>(field: FieldSelector<Values, T>): FieldState<T>;
}

export interface FormStoreProviderProps<Values extends object> {
  store: StoreApi<FormStore<Values>>;
  children: React.ReactNode;
}

type FieldStateTuple<T> = [T, (next: T) => void];

export interface FieldState<T> {
  value: T;
  setValue: (next: T) => void;
  isTouched: boolean;
  setIsTouched: (next: boolean) => void;
  error?: string;
  setError: (next?: string) => void;
}

export function createReactBindings<Values extends object>(): ReactBindings<Values> {
  const FormStoreContext = createContext<StoreApi<FormStore<Values>> | undefined>(undefined);

  function FormStoreProvider({ store, children }: FormStoreProviderProps<Values>) {
    return <FormStoreContext.Provider value={store}>{children}</FormStoreContext.Provider>;
  }

  function useFormStoreContext() {
    const ctx = useContext(FormStoreContext);
    if (ctx === undefined) {
      throw new Error('FormStoreContext was not found. Are you missing a Provider?');
    }
    return ctx;
  }

  function useFormStore<T>(selectorFn: (state: FormStore<Values>) => T, equalifyFn?: (a: T, b: T) => boolean): T {
    const store = useFormStoreContext();
    return useStore(store, selectorFn, equalifyFn);
  }

  function useFieldValue<T>(field: FieldSelector<Values, T>): FieldStateTuple<T> {
    const value = useFormStore((state) => state.getFieldValue(field));
    const setFieldValue = useFormStore((s) => s.setFieldValue);
    const setValue = (value: T) => setFieldValue(field, value);
    return [value, setValue];
  }

  function useFieldTouched(field: FieldSelector<Values, unknown>): FieldStateTuple<boolean> {
    const isTouched = useFormStore((state) => state.getFieldTouched(field));
    const setFieldTouched = useFormStore((state) => state.setFieldTouched);
    const setIsTouched = (isTouched: boolean) => setFieldTouched(field, isTouched);
    return [isTouched, setIsTouched];
  }

  function useFieldError(field: FieldSelector<Values, unknown>): FieldStateTuple<string | undefined> {
    const error = useFormStore((state) => state.getFieldError(field));
    const setFieldError = useFormStore((state) => state.setFieldError);
    const setError = (error?: string) => setFieldError(field, error);
    return [error, setError];
  }

  function useField<T>(field: FieldSelector<Values, T>): FieldState<T> {
    const [value, setValue] = useFieldValue(field);
    const [isTouched, setIsTouched] = useFieldTouched(field);
    const [error, setError] = useFieldError(field);

    return {
      value,
      setValue,
      isTouched,
      setIsTouched,
      error,
      setError,
    };
  }

  return {
    FormStoreContext,
    FormStoreProvider,
    useFormStoreContext,
    useFormStore,
    useFieldValue,
    useFieldTouched,
    useFieldError,
    useField,
  };
}
