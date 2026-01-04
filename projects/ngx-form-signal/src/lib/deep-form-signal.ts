import {
   assertInInjectionContext,
   inject,
   Injector,
   isSignal,
   Signal,
   signal,
   untracked,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { formSignal } from './form-signal';
import { buildFormControlsSignal } from './helpers/form-controls-signal';
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

   const formAsSignal = (
      isSignal(form) ? form : signal(form).asReadonly()
   ) as Signal<AbstractControl | null>;

   const root = formSignal(formAsSignal, options);

   const controls$ = buildFormControlsSignal(formAsSignal, options);
   const controlProxy = new Proxy(controls$, {
      get(_target, prop, receiver) {
         const snapshot = untracked(_target);
         if (!snapshot) return null;
         if (prop in snapshot) {
            return snapshot?.[prop as any];
         }
         return Reflect.get(_target, prop, receiver);
      },
      apply(_target, _thisArg, _args) {
         return _target();
      },
   });

   Object.defineProperty(root, 'controls', {
      get: () => controlProxy,
   });

   return root as DeepFormSignal<T>;
}
