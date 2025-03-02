import {
   Signal,
   WritableSignal,
   computed,
   isSignal,
   signal,
} from '@angular/core';
import { FormControlStatus } from '@angular/forms';
import { FormSignalOptions } from '../types/form-signal-options';
import { FormFromType, OptionalFormFromType } from '../types/form-type';

export function buildFormErrorSignal<T = any>(
   form: Signal<OptionalFormFromType<T>> | OptionalFormFromType<T>,
   valueSignal: WritableSignal<FormFromType<T>['value'] | null>,
   statusSignal: WritableSignal<FormControlStatus | null>,
   options: FormSignalOptions<T>
) {
   const formAsSignal = isSignal(form) ? form : signal(form);

   return computed(
      () => {
         const v = valueSignal();
         const s = statusSignal();
         return formAsSignal()?.errors ?? null;
      },
      { equal: options.equalityFns?.errorsEquality }
   );
}
