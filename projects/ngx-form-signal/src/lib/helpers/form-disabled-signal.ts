import { computed, WritableSignal } from '@angular/core';
import { FormControlStatus } from '@angular/forms';

export function buildFormDisabledSignal(
   statusSignal: WritableSignal<FormControlStatus | null>
) {
   return computed(() => {
      return statusSignal() === 'DISABLED';
   });
}
