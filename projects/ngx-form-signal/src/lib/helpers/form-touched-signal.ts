import { computed, signal, Signal } from '@angular/core';
import { AbstractControl, TouchedChangeEvent } from '@angular/forms';
import { filter, map, Observable, of } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormTouchedSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const touched$ = signal<boolean>(false, {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const untouched$ = computed(() => !touched$(), {
      equal: options.eagerNotify ? () => false : undefined,
   });

   const formStream$ = computed<{
      form: T | null;
      stream: Observable<boolean>;
   }>(() => {
      const form = formAsSignal();
      const touchedStream = form?.events.pipe(
         filter((e) => e instanceof TouchedChangeEvent),
         map(() => !!form.touched)
      );
      return { form, stream: touchedStream ? touchedStream : of(false) };
   });

   handleStreamSignal(
      formStream$,
      (form) => {
         touched$.set(!!form?.touched);
      },
      options
   );

   return { touched$: touched$.asReadonly(), untouched$ };
}
