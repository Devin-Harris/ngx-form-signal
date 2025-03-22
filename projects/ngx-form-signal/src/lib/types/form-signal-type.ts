import { Signal } from '@angular/core';
import { buildFormDirtySignal } from '../helpers/form-dirty-signal';
import { buildFormErrorSignal } from '../helpers/form-error-signal';
import { buildFormStatusSignal } from '../helpers/form-status-signal';
import { buildFormTouchedSignal } from '../helpers/form-touched-signal';
import { buildFormValueSignal } from '../helpers/form-value-signal';

export type FormSignalSubscriptionsState<T = any> = {
   valueChangeSubscription: ReturnType<
      ReturnType<
         typeof buildFormValueSignal<T>
      >['valueChangeSubscription$']['asReadonly']
   >;
   statusChangeSubscription: ReturnType<
      ReturnType<
         typeof buildFormStatusSignal
      >['statusChangeSubscription$']['asReadonly']
   >;
   touchedChangeSubscription: ReturnType<
      ReturnType<
         typeof buildFormTouchedSignal
      >['touchedChangeSubscription$']['asReadonly']
   >;
   dirtyChangeSubscription: ReturnType<
      ReturnType<
         typeof buildFormDirtySignal
      >['dirtyChangeSubscription$']['asReadonly']
   >;
};
export type FormSignalState<T = any> = {
   status: ReturnType<
      ReturnType<typeof buildFormStatusSignal>['status$']['asReadonly']
   >;
   value: ReturnType<
      ReturnType<typeof buildFormValueSignal<T>>['value$']['asReadonly']
   >;
   rawValue: ReturnType<
      ReturnType<typeof buildFormValueSignal<T>>['rawValue$']['asReadonly']
   >;
   touched: ReturnType<
      ReturnType<typeof buildFormTouchedSignal>['touched$']['asReadonly']
   >;
   untouched: ReturnType<typeof buildFormTouchedSignal>['untouched$'];
   dirty: ReturnType<
      ReturnType<typeof buildFormDirtySignal>['dirty$']['asReadonly']
   >;
   pristine: ReturnType<typeof buildFormDirtySignal>['pristine$'];
   valid: ReturnType<typeof buildFormStatusSignal>['valid$'];
   invalid: ReturnType<typeof buildFormStatusSignal>['invalid$'];
   pending: ReturnType<typeof buildFormStatusSignal>['pending$'];
   disabled: ReturnType<typeof buildFormStatusSignal>['disabled$'];
   enabled: ReturnType<typeof buildFormStatusSignal>['enabled$'];
   errors: ReturnType<typeof buildFormErrorSignal>;
   subscriptions: FormSignalSubscriptionsState<T>;
};

export type FormSnapshotSignalSubscriptionsState<T = any> = {
   [x in keyof FormSignalSubscriptionsState<T>]: ReturnType<
      FormSignalSubscriptionsState<T>[x]
   >;
};
export type FormSnapshotSignalState<T = any> = {
   [x in keyof Omit<FormSignalState<T>, 'subscriptions'>]: ReturnType<
      FormSignalState<T>[x]
   >;
} & { subscriptions: FormSnapshotSignalSubscriptionsState<T> };

export type FormSignal<T = any> = FormSignalState<T> &
   Signal<FormSnapshotSignalState<T>>;
