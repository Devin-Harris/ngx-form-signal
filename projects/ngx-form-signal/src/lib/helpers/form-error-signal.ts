import { computed, Signal, signal } from '@angular/core';
import { AbstractControl, StatusChangeEvent, ValidationErrors, ValueChangeEvent } from '@angular/forms';
import { filter, map, Observable, of } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormErrorSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   let initErrors: ValidationErrors | null = null;
   try {
      // Attempt read of formAsSignal in try catch
      // to prevent input.required errors
      initErrors = formAsSignal()?.errors ?? null;
   } catch {}

   const error$ = signal<ValidationErrors | null>(initErrors, {
      equal: options.eagerNotify ? () => false : undefined,
   });

   const formStream$ = computed<{
      form: T | null;
      stream: Observable<any>;
   }>(() => {
      const form = formAsSignal();
      const errorStream = form?.events.pipe(
         filter((e) => e instanceof StatusChangeEvent || e instanceof ValueChangeEvent),
         map(() => form.errors)
      );
      return { form, stream: errorStream ? errorStream : of(null) };
   });

   handleStreamSignal(
      formStream$,
      (form) => {
         error$.set(form?.errors ?? null);
      },
      options
   );

   return error$.asReadonly();
}
