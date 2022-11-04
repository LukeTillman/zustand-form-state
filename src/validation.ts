import { SelectorPath } from './selector';

export type ValidationState = Record<SelectorPath, string | undefined>;

export interface ValidationOptions<Values extends object> {
  when: 'change' | 'blur' | 'both';
  adapter: ValidationAdapter<Values>;
}

export interface ValidationAdapter<Values extends object> {
  validate(values: Values): ValidationState;
}
