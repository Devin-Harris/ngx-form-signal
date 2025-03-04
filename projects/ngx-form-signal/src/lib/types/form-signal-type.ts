import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { buildFormDirtySignal } from '../helpers/form-dirty-signal';
import { buildFormErrorSignal } from '../helpers/form-error-signal';
import { buildFormStatusSignal } from '../helpers/form-status-signal';
import { buildFormTouchedSignal } from '../helpers/form-touched-signal';
import { buildFormValueSignal } from '../helpers/form-value-signal';
import { FormFromType } from './form-type';

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
   (() => FormSnapshotSignalState<T>);

type DeepFormSignalNestedHelper<T, K> = FormFromType<T> extends
   | FormGroup
   | FormArray
   ? K extends keyof FormFromType<T>['controls']
      ? FormFromType<T>['controls'][K] extends FormControl
         ? FormSignal<FormFromType<T>['controls'][K]['value']>
         : FormFromType<T>['controls'][K] extends FormGroup
           ? DeepFormSignal<FormFromType<T>['controls'][K]['controls']>
           : FormFromType<T>['controls'][K] extends FormArray
             ? DeepFormSignal<FormFromType<T>['controls'][K]['controls']>
             : never
      : never
   : never;

export type DeepFormSignal<T = any> = FormSignal<T> &
   (FormFromType<T> extends FormControl
      ? never
      : {
           children: FormFromType<T> extends FormControl
              ? FormSignal<T>
              : FormFromType<T> extends FormGroup
                ? FormFromType<T>['controls'] extends Array<any>
                   ? {
                        [K: number]: DeepFormSignalNestedHelper<T, number>;
                     }
                   : {
                        [K in keyof FormFromType<T>['controls']]: DeepFormSignalNestedHelper<
                           T,
                           K
                        >;
                     }
                : FormFromType<T> extends FormArray
                  ? {
                       [K: number]: DeepFormSignalNestedHelper<T, number>;
                    }
                  : never;
        });
