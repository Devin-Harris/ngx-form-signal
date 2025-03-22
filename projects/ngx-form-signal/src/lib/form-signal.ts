import {
   assertInInjectionContext,
   isSignal,
   Signal,
   signal,
} from '@angular/core';
import { buildFormDirtySignal } from './helpers/form-dirty-signal';
import { buildFormErrorSignal } from './helpers/form-error-signal';
import { buildFormSnapshotSignal } from './helpers/form-snapshot-signal';
import { buildFormStatusSignal } from './helpers/form-status-signal';
import { buildFormTouchedSignal } from './helpers/form-touched-signal';
import { buildFormValueSignal } from './helpers/form-value-signal';
import {
   buildDefaultFormSignalOptions,
   FormSignalOptions,
} from './types/form-signal-options';
import { FormSignal, FormSignalState } from './types/form-signal-type';
import { OptionalFormFromType } from './types/form-type';

export function formSignal<T = any>(
   form: Signal<OptionalFormFromType<T>> | OptionalFormFromType<T>,
   options: FormSignalOptions<T> = buildDefaultFormSignalOptions<T>()
): FormSignal<T> {
   const formAsSignal = isSignal(form) ? form : signal(form);
   if (!options.injector) {
      assertInInjectionContext(() => {});
   }
   const { value$, rawValue$, valueChangeSubscription$ } =
      buildFormValueSignal<T>(formAsSignal, options);
   const {
      status$,
      valid$,
      invalid$,
      pending$,
      disabled$,
      enabled$,
      statusChangeSubscription$,
   } = buildFormStatusSignal<T>(formAsSignal, options);
   const { touched$, untouched$, touchedChangeSubscription$ } =
      buildFormTouchedSignal(formAsSignal, options);
   const { dirty$, pristine$, dirtyChangeSubscription$ } = buildFormDirtySignal(
      formAsSignal,
      options
   );
   const errors$ = buildFormErrorSignal(formAsSignal, value$, status$, options);

   const formSignals: FormSignalState<T> = {
      status: status$.asReadonly(),
      value: value$.asReadonly(),
      rawValue: rawValue$.asReadonly(),
      touched: touched$.asReadonly(),
      untouched: untouched$,
      dirty: dirty$.asReadonly(),
      pristine: pristine$,
      valid: valid$,
      invalid: invalid$,
      pending: pending$,
      disabled: disabled$,
      enabled: enabled$,
      errors: errors$,
      subscriptions: {
         valueChangeSubscription: valueChangeSubscription$.asReadonly(),
         statusChangeSubscription: statusChangeSubscription$.asReadonly(),
         touchedChangeSubscription: touchedChangeSubscription$.asReadonly(),
         dirtyChangeSubscription: dirtyChangeSubscription$.asReadonly(),
      },
   };

   const snapshot$ = buildFormSnapshotSignal(formSignals);
   const formSignalObj = (() => snapshot$()) as FormSignal<T>;

   Object.setPrototypeOf(formSignalObj, formSignals);

   return formSignalObj;
}
