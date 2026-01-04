import {
   assertInInjectionContext,
   inject,
   Injector,
   isSignal,
   Signal,
   signal,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
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
import { FormSignal, FormSignalState } from './types/form-signal-type';

export function formSignal<T extends FormSignalInput>(
   form: T,
   options: FormSignalOptions = buildDefaultFormSignalOptions()
): FormSignal<NonNullable<FormSignalForm<T>>> {
   if (!options.injector) {
      assertInInjectionContext(() => {});
      options.injector = inject(Injector);
   }

   const formAsSignal = (isSignal(form) ? form : signal(form).asReadonly()) as
      | Signal<AbstractControl>
      | Signal<AbstractControl | null>;

   const { value$, rawValue$ } = buildFormValueSignal(formAsSignal, options);
   const { status$, valid$, invalid$, pending$, disabled$, enabled$ } =
      buildFormStatusSignal(formAsSignal, options);
   const { touched$, untouched$ } = buildFormTouchedSignal(
      formAsSignal,
      options
   );
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
   };

   const snapshot$ = buildFormSnapshotSignal(formSignals);
   Object.setPrototypeOf(snapshot$, formSignals);

   return snapshot$ as FormSignal<NonNullable<FormSignalForm<T>>>;
}
