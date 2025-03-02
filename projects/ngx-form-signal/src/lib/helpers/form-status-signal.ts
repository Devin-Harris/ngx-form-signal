import { effect, Injector, Signal, signal, untracked } from '@angular/core';
import { FormControlStatus } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OptionalFormFromType } from '../types/form-type';

export function buildFormStatusSignal<T = any>(
   formAsSignal: Signal<OptionalFormFromType<T>>,
   injector?: Injector
) {
   const status$ = signal<FormControlStatus | null>(
      formAsSignal()?.status ?? null,
      { equal: () => false }
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
         onCleanup(() =>
            untracked(() => statusChangeSubscription$())?.unsubscribe()
         );
      },
      { injector }
   );
   return { status$, statusChangeSubscription$ };
}
