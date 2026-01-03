import { computed, signal, Signal } from '@angular/core';
import {
   AbstractControl,
   FormControlStatus,
   StatusChangeEvent,
} from '@angular/forms';
import { filter, map, Observable, of } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormStatusSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const status$ = signal<FormControlStatus | null>(null, {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const valid$ = computed(() => status$() === 'VALID', {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const invalid$ = computed(() => status$() === 'INVALID', {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const pending$ = computed(() => status$() == 'PENDING', {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const disabled$ = computed(() => status$() === 'DISABLED', {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const enabled$ = computed(() => !disabled$(), {
      equal: options.eagerNotify ? () => false : undefined,
   });

   const formStream$ = computed<{
      form: T | null;
      stream: Observable<FormControlStatus | null>;
   }>(() => {
      const form = formAsSignal();
      const statusStream = form?.events.pipe(
         filter((e) => e instanceof StatusChangeEvent),
         map(() => form.status)
      );
      return { form, stream: statusStream ? statusStream : of(null) };
   });

   handleStreamSignal(
      formStream$,
      (form) => {
         status$.set(form?.status ?? null);
      },
      options
   );

   return {
      status$,
      valid$,
      invalid$,
      pending$,
      disabled$,
      enabled$,
   };
}
