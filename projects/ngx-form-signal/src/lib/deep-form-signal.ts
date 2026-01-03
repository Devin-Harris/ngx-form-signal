import {
   assertInInjectionContext,
   computed,
   inject,
   Injector,
   isSignal,
   signal,
   Signal,
   untracked,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { formSignal } from './form-signal';
import {
   DeepFormSignal,
   DeepSignalFormInput,
} from './types/deep-form-signal-type';
import {
   buildDefaultFormSignalOptions,
   FormSignalOptions,
} from './types/form-signal-options';

export function deepFormSignal<T extends DeepSignalFormInput>(
   form: T,
   options: FormSignalOptions = buildDefaultFormSignalOptions()
): DeepFormSignal<T> {
   if (!options.injector) {
      assertInInjectionContext(() => {});
      options.injector = inject(Injector);
   }

   const formAsSignal = isSignal(form) ? form : signal(form).asReadonly();

   const root = formSignal(
      formAsSignal as T extends Signal<infer P> ? NonNullable<P> : T,
      options
   );

   Object.defineProperty(root, 'controls', {
      get: computed(() => {
         const form = formAsSignal();

         return untracked(() => {
            if (form instanceof FormArray) {
               return form.controls.map((c) => deepFormSignal(c, options));
            }

            if (form instanceof FormGroup) {
               return Object.keys(form.controls).reduce(
                  (acc, key) => ({
                     ...acc,
                     [key]: deepFormSignal(form.controls[key], options),
                  }),
                  {}
               );
            }

            return null;
         });
      }),
   });

   return root as DeepFormSignal<T>;
}
