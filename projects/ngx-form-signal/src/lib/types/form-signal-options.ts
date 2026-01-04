import { Injector, Signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

export type FormSignalInput =
   | AbstractControl
   | Signal<AbstractControl>
   | Signal<AbstractControl | null>;

export type FormSignalForm<T extends FormSignalInput> = T extends Signal<
   infer P
>
   ? P
   : T;

export type FormSignalOptions = {
   injector?: Injector;
   /**
    * When true, signals notify eagerly on every control event,
    * bypassing equality checks and memoization.
    */
   eagerNotify?: boolean;
};

export function buildDefaultFormSignalOptions(): FormSignalOptions {
   return {};
}
