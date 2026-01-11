import { computed, signal, Signal } from '@angular/core';
import { AbstractControl, ValueChangeEvent } from '@angular/forms';
import { filter, map, Observable, of, startWith } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormValueSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   let initValue: T | null = null;
   let initRawValue: ReturnType<T['getRawValue']> | null = null;
   try {
      // Attempt read of formAsSignal in try catch
      // to prevent input.required errors
      initValue = formAsSignal()?.value ?? null;
      initRawValue = formAsSignal()?.getRawValue() ?? null;
   } catch {}

   const value$ = signal<T['value'] | null>(initValue, {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const rawValue$ = signal<ReturnType<T['getRawValue']> | null>(initRawValue, {
      equal: options.eagerNotify ? () => false : undefined,
   });

   const formStream$ = computed<{
      form: T | null;
      stream: Observable<{ value: T; rawValue: T } | null>;
   }>(() => {
      const form = formAsSignal();
      const valueStream = form?.events.pipe(
         filter((e) => e instanceof ValueChangeEvent),
         map(() => ({ value: form.value, rawValue: form.getRawValue() })),
         startWith({ value: form.value, rawValue: form.getRawValue() })
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
