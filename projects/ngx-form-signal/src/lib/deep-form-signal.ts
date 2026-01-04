import {
   assertInInjectionContext,
   computed,
   inject,
   Injector,
   isSignal,
   runInInjectionContext,
   Signal,
   signal,
   untracked,
} from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { formSignal } from './form-signal';
import { DeepFormSignal } from './types/deep-form-signal-type';
import {
   buildDefaultFormSignalOptions,
   FormSignalInput,
   FormSignalOptions,
} from './types/form-signal-options';

export function deepFormSignal<T extends FormSignalInput>(
   form: T,
   options: FormSignalOptions = buildDefaultFormSignalOptions()
): DeepFormSignal<T> {
   if (!options.injector) {
      assertInInjectionContext(() => {});
      options.injector = inject(Injector);
   }

   const formAsSignal = (isSignal(form) ? form : signal(form).asReadonly()) as
      | Signal<AbstractControl>
      | Signal<AbstractControl | null>;

   const root = runInInjectionContext(options.injector, () =>
      formSignal(formAsSignal, options)
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
