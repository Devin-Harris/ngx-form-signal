import {
   computed,
   effect,
   Injector,
   Signal,
   signal,
   untracked,
} from '@angular/core';
import { TouchedChangeEvent } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { OptionalFormFromType } from '../types/form-type';

export function buildFormTouchedSignal(
   formAsSignal: Signal<OptionalFormFromType<any>>,
   injector?: Injector
) {
   const touched$ = signal<boolean | null>(formAsSignal()?.touched ?? null, {
      equal: () => false,
   });
   const touchedChangeSubscription$ = signal<Subscription | null>(null);

   const formTouchedChangeEffect = effect(
      (onCleanup: Function) => {
         const form = formAsSignal();
         untracked(() => {
            const setTouched = () => {
               untracked(() => {
                  touched$.set(form?.touched ?? null);
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
         onCleanup(() =>
            untracked(() => touchedChangeSubscription$())?.unsubscribe()
         );
      },
      { injector }
   );

   const untouched$ = computed(() => !touched$());

   return { touched$, untouched$, touchedChangeSubscription$ };
}
