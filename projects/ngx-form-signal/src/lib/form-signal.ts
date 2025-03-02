import {
   assertInInjectionContext,
   Injector,
   isSignal,
   Signal,
   signal,
} from '@angular/core';
import { buildFormDirtySignal } from './helpers/form-dirty-signal';
import { buildFormDisabledSignal } from './helpers/form-disabled-signal';
import { buildFormErrorSignal } from './helpers/form-error-signal';
import { buildFormInvalidSignal } from './helpers/form-invalid-signal';
import { buildFormSnapshotSignal } from './helpers/form-snapshot-signal';
import { buildFormStatusSignal } from './helpers/form-status-signal';
import { buildFormTouchedSignal } from './helpers/form-touched-signal';
import { buildFormValueSignal } from './helpers/form-value-signal';
import {
   FormSignalState,
   FormSnapshotSignalState,
} from './types/form-signal-type';
import { OptionalFormFromType } from './types/form-type';

export function formSignal<T = any>(
   form: Signal<OptionalFormFromType<T>> | OptionalFormFromType<T>,
   injector?: Injector
) {
   const formAsSignal = isSignal(form) ? form : signal(form);
   if (!injector) {
      assertInInjectionContext(() => {});
   }
   const { value$, rawValue$, valueChangeSubscription$ } =
      buildFormValueSignal<T>(formAsSignal, injector);
   const { status$, statusChangeSubscription$ } = buildFormStatusSignal<T>(
      formAsSignal,
      injector
   );
   const { touched$, touchedChangeSubscription$ } = buildFormTouchedSignal(
      formAsSignal,
      injector
   );
   const { dirty$, dirtyChangeSubscription$ } = buildFormDirtySignal(
      formAsSignal,
      injector
   );
   const disabled$ = buildFormDisabledSignal(status$);
   const errors$ = buildFormErrorSignal(formAsSignal, value$, status$);
   const invalid$ = buildFormInvalidSignal(formAsSignal, value$, status$);

   const formSignals: FormSignalState<T> = {
      status: status$.asReadonly(),
      value: value$.asReadonly(),
      rawValue: rawValue$.asReadonly(),
      touched: touched$.asReadonly(),
      dirty: dirty$.asReadonly(),
      disabled: disabled$,
      errors: errors$,
      invalid: invalid$,
      subscriptions: {
         valueChangeSubscription: valueChangeSubscription$.asReadonly(),
         statusChangeSubscription: statusChangeSubscription$.asReadonly(),
         touchedChangeSubscription: touchedChangeSubscription$.asReadonly(),
         dirtyChangeSubscription: dirtyChangeSubscription$.asReadonly(),
      },
   };

   const snapshot$ = buildFormSnapshotSignal(formSignals);
   const formSignalObj = (() => snapshot$()) as FormSignalState<T> &
      (() => FormSnapshotSignalState<T>);

   Object.setPrototypeOf(formSignalObj, formSignals);

   return formSignalObj;
}
