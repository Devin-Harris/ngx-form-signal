import { computed, signal, Signal } from '@angular/core';
import { AbstractControl, PristineChangeEvent } from '@angular/forms';
import { filter, map, Observable, of } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { handleStreamSignal } from './handle-stream-signal';

export function buildFormDirtySignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const dirty$ = signal<boolean>(false, {
      equal: options.eagerNotify ? () => false : undefined,
   });
   const pristine$ = computed(() => !dirty$(), {
      equal: options.eagerNotify ? () => false : undefined,
   });

   const formStream$ = computed<{
      form: T | null;
      stream: Observable<boolean>;
   }>(() => {
      const form = formAsSignal();
      const dirtyStream = form?.events.pipe(
         filter((e) => e instanceof PristineChangeEvent),
         map(() => !!form.dirty)
      );
      return { form, stream: dirtyStream ? dirtyStream : of(false) };
   });

   handleStreamSignal(
      formStream$,
      (form) => {
         dirty$.set(!!form?.dirty);
      },
      options
   );

   return { dirty$: dirty$.asReadonly(), pristine$ };
}
