import { computed } from '@angular/core';
import {
   FormSignalState,
   FormSnapshotSignalState,
} from '../types/form-signal-type';

export function buildFormSnapshotSignal<T = any>(
   formSignalState: FormSignalState<T>
) {
   return computed<FormSnapshotSignalState<T>>(() => {
      return {
         status: formSignalState.status(),
         value: formSignalState.value(),
         rawValue: formSignalState.rawValue(),
         touched: formSignalState.touched(),
         untouched: formSignalState.untouched(),
         dirty: formSignalState.dirty(),
         pristine: formSignalState.pristine(),
         valid: formSignalState.valid(),
         invalid: formSignalState.invalid(),
         pending: formSignalState.pending(),
         disabled: formSignalState.disabled(),
         enabled: formSignalState.enabled(),
         errors: formSignalState.errors(),
         subscriptions: {
            valueChangeSubscription:
               formSignalState.subscriptions.valueChangeSubscription(),
            statusChangeSubscription:
               formSignalState.subscriptions.statusChangeSubscription(),
            touchedChangeSubscription:
               formSignalState.subscriptions.touchedChangeSubscription(),
            dirtyChangeSubscription:
               formSignalState.subscriptions.dirtyChangeSubscription(),
         },
      };
   });
}
