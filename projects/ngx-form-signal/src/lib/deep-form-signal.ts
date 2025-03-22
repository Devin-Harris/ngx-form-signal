import { isSignal, Signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { formSignal } from './form-signal';
import { DeepFormSignal } from './types/deep-form-signal-type';
import {
   buildDefaultFormSignalOptions,
   DeepFormSignalOptions,
} from './types/form-signal-options';
import { OptionalFormFromType } from './types/form-type';

export function deepFormSignal<T = any>(
   form: Signal<OptionalFormFromType<T>> | OptionalFormFromType<T>,
   options: DeepFormSignalOptions<T> = buildDefaultFormSignalOptions<T>()
): DeepFormSignal<T> {
   const root: DeepFormSignal<T> = formSignal<T>(
      form,
      options
   ) as DeepFormSignal<T>;

   const formVal = isSignal(form) ? form() : form;
   if (formVal && !(formVal instanceof FormControl)) {
      let children: DeepFormSignal<T>['children'] | null = null;

      if (formVal instanceof FormArray) {
         // @ts-ignore
         children = formVal.controls.map((c) => deepFormSignal(c, options));
      } else if (formVal instanceof FormGroup) {
         const controls = formVal.controls;
         const keys = Object.keys(controls);
         children = keys.reduce(
            (acc, cKey) => {
               // @ts-ignore
               acc[cKey] = deepFormSignal(controls[cKey], options);
               return acc;
            },
            {} as DeepFormSignal<T>['children']
         );
      }

      root.children = children;
   }

   return root;
}
