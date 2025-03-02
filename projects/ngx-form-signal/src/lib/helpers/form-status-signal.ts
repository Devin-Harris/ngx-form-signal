import { computed, effect, Signal, signal, untracked } from '@angular/core';
import { FormControlStatus } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { OptionalFormFromType } from '../types/form-type';

export function buildFormStatusSignal<T = any>(
   formAsSignal: Signal<OptionalFormFromType<T>>,
   options: FormSignalOptions<T>
) {
   const equal = options.equalityFns?.statusEquality ?? (() => false);
   const status$ = signal<FormControlStatus | null>(
      formAsSignal()?.status ?? null,
      { equal }
   );
   const statusChangeSubscription$ = signal<Subscription | null>(null);
   const formStatusChangeEffect = effect(
      (onCleanup: Function) => {
         const form = formAsSignal();
         untracked(() => {
            const setStatus = () => {
               untracked(() => {
                  status$.set(form?.status ?? null);
               });
            };

            statusChangeSubscription$()?.unsubscribe();
            statusChangeSubscription$.set(
               form?.statusChanges.subscribe(() => {
                  setStatus();
               }) ?? null
            );
            setStatus();
         });
         onCleanup(
            () => untracked(() => statusChangeSubscription$())?.unsubscribe()
         );
      },
      { injector: options.injector }
   );

   const valid$ = computed(() => status$() === 'VALID');
   const invalid$ = computed(() => status$() === 'INVALID');
   const pending$ = computed(() => status$() == 'PENDING');
   const disabled$ = computed(() => status$() === 'DISABLED');
   const enabled$ = computed(() => status$() !== 'DISABLED');

   return {
      status$,
      valid$,
      invalid$,
      pending$,
      disabled$,
      enabled$,
      statusChangeSubscription$,
   };
}
