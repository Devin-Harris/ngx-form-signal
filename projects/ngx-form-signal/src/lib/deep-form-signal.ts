import { assertInInjectionContext, inject, Injector, isSignal, Signal, signal, untracked } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { formSignal } from './form-signal';
import { buildFormControlsSignal } from './helpers/form-controls-signal';
import { DeepFormSignal } from './types/deep-form-signal-type';
import { buildDefaultFormSignalOptions, FormSignalInput, FormSignalOptions } from './types/form-signal-options';

/**
 * Takes a reactive form control and subscribes to various events to pull out
 * form states and store them into signals.
 *
 * Creates a formSignal for each nested control inside children groups and arrays.
 * These are made accessible over an additional `controls` property.
 */
export function deepFormSignal<T extends FormSignalInput>(
   form: T,
   options: FormSignalOptions = buildDefaultFormSignalOptions()
): DeepFormSignal<T> {
   if (!options.injector) {
      assertInInjectionContext(() => {});
      options.injector = inject(Injector);
   }

   const formAsSignal = (isSignal(form) ? form : signal(form).asReadonly()) as Signal<AbstractControl | null>;

   const root = formSignal(formAsSignal, options);

   const controls$ = buildFormControlsSignal(formAsSignal, options);
   const controlProxy = new Proxy(controls$, {
      get(_target, prop, receiver) {
         const snapshot = untracked(() => _target());
         if (!snapshot) return null;

         if (Array.isArray(snapshot)) return snapshot[prop as unknown as number];
         return snapshot?.[prop as string];
      },
      apply(_target, _thisArg, _args) {
         return _target() ?? null;
      },
   });

   Object.defineProperty(root, 'controls', {
      get: () => {
         const snapshot = untracked(() => controls$());
         return snapshot ? controlProxy : null;
      },
   });

   return root as DeepFormSignal<T>;
}
