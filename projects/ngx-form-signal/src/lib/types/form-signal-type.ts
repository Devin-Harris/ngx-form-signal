import { buildFormDirtySignal } from '../helpers/form-dirty-signal';
import { buildFormDisabledSignal } from '../helpers/form-disabled-signal';
import { buildFormErrorSignal } from '../helpers/form-error-signal';
import { buildFormInvalidSignal } from '../helpers/form-invalid-signal';
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
   dirty: ReturnType<
      ReturnType<typeof buildFormDirtySignal>['dirty$']['asReadonly']
   >;
   disabled: ReturnType<typeof buildFormDisabledSignal>;
   errors: ReturnType<typeof buildFormErrorSignal>;
   invalid: ReturnType<typeof buildFormInvalidSignal>;
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
