import { computed, signal, Signal } from '@angular/core';
import { AbstractControl, TouchedChangeEvent } from '@angular/forms';
import { filter, map, Observable, of } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormTouchedSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   let initTouched = false;
   try {
      // Attempt read of formAsSignal in try catch
      // to prevent input.required errors
      initTouched = formAsSignal()?.touched ?? false;
   } catch {}

   const touched$ = signal<boolean>(initTouched, {
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
