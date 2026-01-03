import { computed, signal, Signal } from '@angular/core';
import { AbstractControl, ValueChangeEvent } from '@angular/forms';
import { filter, Observable, of } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormValueSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const value$ = signal<T['value'] | null>(null, {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const rawValue$ = signal<ReturnType<T['getRawValue']> | null>(null, {
      equal: options.eagerNotify ? () => false : undefined,
   });

   const formStream$ = computed<{
      form: T | null;
      stream: Observable<ValueChangeEvent<T> | null>;
   }>(() => {
      const form = formAsSignal();
      const valueStream = form?.events.pipe(
         filter((e) => e instanceof ValueChangeEvent)
      );
      return { form, stream: valueStream ? valueStream : of(null) };
   });

   handleStreamSignal(
      formStream$,
      (form) => {
         value$.set(form?.value ?? null);
         rawValue$.set(form?.getRawValue() ?? null);
      },
      options
   );

   return { value$: value$.asReadonly(), rawValue$: rawValue$.asReadonly() };
}
