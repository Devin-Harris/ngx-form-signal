import { computed, effect, Signal, signal, untracked } from '@angular/core';
import { TouchedChangeEvent } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { OptionalFormFromType } from '../types/form-type';

export function buildFormTouchedSignal(
   formAsSignal: Signal<OptionalFormFromType<any>>,
   options: FormSignalOptions
) {
   const touched$ = signal<boolean>(!!formAsSignal()?.touched, {
      equal: options.equalityFns?.touchedEquality,
   });
   const touchedChangeSubscription$ = signal<Subscription | null>(null);

   const formTouchedChangeEffect = effect(
      (onCleanup: Function) => {
         const form = formAsSignal();
         untracked(() => {
            const setTouched = () => {
               untracked(() => {
                  touched$.set(!!form?.touched);
               });
            };

            touchedChangeSubscription$()?.unsubscribe();
            touchedChangeSubscription$.set(
               form?.events
                  .pipe(filter((e) => e instanceof TouchedChangeEvent))
                  .subscribe((e) => {
                     setTouched();
                  }) ?? null
            );
            setTouched();
         });
         onCleanup(
            () => untracked(() => touchedChangeSubscription$())?.unsubscribe()
         );
      },
      { injector: options.injector }
   );

   const untouched$ = computed(() => !touched$(), {
      equal: options.equalityFns?.touchedEquality,
   });

   return { touched$, untouched$, touchedChangeSubscription$ };
}
