import { assertInInjectionContext, inject, Injector, isSignal, Signal, signal } from '@angular/core';
import { buildFormDirtySignal } from './helpers/form-dirty-signal';
import { buildFormErrorSignal } from './helpers/form-error-signal';
import { buildFormSnapshotSignal } from './helpers/form-snapshot-signal';
import { buildFormStatusSignal } from './helpers/form-status-signal';
import { buildFormTouchedSignal } from './helpers/form-touched-signal';
import { buildFormValueSignal } from './helpers/form-value-signal';
import {
   buildDefaultFormSignalOptions,
   FormSignalForm,
   FormSignalInput,
   FormSignalOptions,
} from './types/form-signal-options';
import { FORM_SIGNAL_FORM_TOKEN, FormSignal, FormSignalState } from './types/form-signal-type';

/**
 * Takes a reactive form control and subscribes to various events to pull out
 * form states and store them into signals.
 */
export function formSignal<T extends FormSignalInput>(
   form: T,
   options: FormSignalOptions = buildDefaultFormSignalOptions()
): FormSignal<NonNullable<FormSignalForm<T>>> {
   if (!options.injector) {
      assertInInjectionContext(() => {});
      options.injector = inject(Injector);
   }

   const formAsSignal = (isSignal(form) ? form : signal(form).asReadonly()) as Signal<NonNullable<
      FormSignalForm<T>
   > | null>;

   const { value$, rawValue$ } = buildFormValueSignal(formAsSignal, options);
   const { status$, valid$, invalid$, pending$, disabled$, enabled$ } = buildFormStatusSignal(formAsSignal, options);
   const { touched$, untouched$ } = buildFormTouchedSignal(formAsSignal, options);
   const { dirty$, pristine$ } = buildFormDirtySignal(formAsSignal, options);
   const errors$ = buildFormErrorSignal(formAsSignal, options);

   const formSignals: FormSignalState<NonNullable<FormSignalForm<T>>> = {
      status: status$,
      value: value$,
      rawValue: rawValue$,
      touched: touched$,
      untouched: untouched$,
      dirty: dirty$,
      pristine: pristine$,
      valid: valid$,
      invalid: invalid$,
      pending: pending$,
      disabled: disabled$,
      enabled: enabled$,
      errors: errors$,
      [FORM_SIGNAL_FORM_TOKEN]: formAsSignal,
   };

   const snapshot$ = buildFormSnapshotSignal(formSignals);
   Object.setPrototypeOf(snapshot$, formSignals);

   return snapshot$ as FormSignal<NonNullable<FormSignalForm<T>>>;
}
