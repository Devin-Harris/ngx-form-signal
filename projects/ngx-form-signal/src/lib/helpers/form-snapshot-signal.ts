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
         dirty: formSignalState.dirty(),
         disabled: formSignalState.disabled(),
         errors: formSignalState.errors(),
         invalid: formSignalState.invalid(),
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
