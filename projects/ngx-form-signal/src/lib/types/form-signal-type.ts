import { Signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { buildFormDirtySignal } from '../helpers/form-dirty-signal';
import { buildFormErrorSignal } from '../helpers/form-error-signal';
import { buildFormSnapshotSignal } from '../helpers/form-snapshot-signal';
import { buildFormStatusSignal } from '../helpers/form-status-signal';
import { buildFormTouchedSignal } from '../helpers/form-touched-signal';
import { buildFormValueSignal } from '../helpers/form-value-signal';

export const FORM_SIGNAL_FORM_TOKEN = Symbol('FORM_SIGNAL_FORM_TOKEN');

export type FormSignalState<T extends AbstractControl<any>> = {
   status: ReturnType<typeof buildFormStatusSignal>['status$'];
   value: ReturnType<typeof buildFormValueSignal<T>>['value$'];
   rawValue: ReturnType<typeof buildFormValueSignal<T>>['rawValue$'];
   touched: ReturnType<typeof buildFormTouchedSignal>['touched$'];
   untouched: ReturnType<typeof buildFormTouchedSignal>['untouched$'];
   dirty: ReturnType<typeof buildFormDirtySignal>['dirty$'];
   pristine: ReturnType<typeof buildFormDirtySignal>['pristine$'];
   valid: ReturnType<typeof buildFormStatusSignal>['valid$'];
   invalid: ReturnType<typeof buildFormStatusSignal>['invalid$'];
   pending: ReturnType<typeof buildFormStatusSignal>['pending$'];
   disabled: ReturnType<typeof buildFormStatusSignal>['disabled$'];
   enabled: ReturnType<typeof buildFormStatusSignal>['enabled$'];
   errors: ReturnType<typeof buildFormErrorSignal>;
   [FORM_SIGNAL_FORM_TOKEN]: Signal<T | null>;
};

export type FormSnapshotSignalState<T extends AbstractControl<any>> = {
   [x in keyof Omit<
      FormSignalState<T>,
      typeof FORM_SIGNAL_FORM_TOKEN
   >]: ReturnType<FormSignalState<T>[x]>;
};

export type FormSignal<T extends AbstractControl<any>> = FormSignalState<T> &
   ReturnType<typeof buildFormSnapshotSignal<T>>;
