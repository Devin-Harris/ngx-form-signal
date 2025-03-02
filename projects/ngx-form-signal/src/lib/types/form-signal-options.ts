import { Injector, ValueEqualityFn } from '@angular/core';
import { FormControlStatus, ValidationErrors } from '@angular/forms';
import { FormFromType } from './form-type';

export type FormSignalEqualityOptions<T = any> = {
   dirtyEquality: ValueEqualityFn<boolean>;
   touchedEquality: ValueEqualityFn<boolean>;
   valueEquality: ValueEqualityFn<FormFromType<T>['value'] | null>;
   statusEquality: ValueEqualityFn<FormControlStatus | null>;
   errorsEquality: ValueEqualityFn<ValidationErrors | null>;
};
export type FormSignalOptions<T = any> = {
   injector?: Injector;
   equalityFns?: Partial<FormSignalEqualityOptions<T>>;
};

export const defaultFormSignalOptions: FormSignalOptions = {};
export function buildDefaultFormSignalOptions<T = any>(): FormSignalOptions<T> {
   return structuredClone(defaultFormSignalOptions);
}
