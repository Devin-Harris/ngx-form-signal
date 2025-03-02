import { computed, effect, Signal, signal, untracked } from '@angular/core';
import { PristineChangeEvent } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { OptionalFormFromType } from '../types/form-type';

export function buildFormDirtySignal(
   formAsSignal: Signal<OptionalFormFromType<any>>,
   options: FormSignalOptions
) {
   const dirty$ = signal<boolean>(!!formAsSignal()?.dirty, {
      equal: options.equalityFns?.dirtyEquality,
   });
   const dirtyChangeSubscription$ = signal<Subscription | null>(null);

   const formDirtyChangeEffect = effect(
      (onCleanup: Function) => {
         const form = formAsSignal();
         untracked(() => {
            const setDirty = () => {
               untracked(() => {
                  dirty$.set(!!form?.dirty);
               });
            };

            dirtyChangeSubscription$()?.unsubscribe();
            dirtyChangeSubscription$.set(
               form?.events
                  .pipe(filter((e) => e instanceof PristineChangeEvent))
                  .subscribe((e) => {
                     setDirty();
                  }) ?? null
            );
            setDirty();
         });
         onCleanup(
            () => untracked(() => dirtyChangeSubscription$())?.unsubscribe()
         );
      },
      { injector: options.injector }
   );

   const pristine$ = computed(() => !dirty$());

   return { dirty$, pristine$, dirtyChangeSubscription$ };
}
