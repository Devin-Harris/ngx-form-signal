import {
   computed,
   effect,
   Injector,
   Signal,
   signal,
   untracked,
} from '@angular/core';
import { PristineChangeEvent } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { OptionalFormFromType } from '../types/form-type';

export function buildFormDirtySignal(
   formAsSignal: Signal<OptionalFormFromType<any>>,
   injector?: Injector
) {
   const dirty$ = signal<boolean | null>(formAsSignal()?.dirty ?? null, {
      equal: () => false,
   });
   const dirtyChangeSubscription$ = signal<Subscription | null>(null);

   const formDirtyChangeEffect = effect(
      (onCleanup: Function) => {
         const form = formAsSignal();
         untracked(() => {
            const setDirty = () => {
               untracked(() => {
                  dirty$.set(form?.dirty ?? null);
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
         onCleanup(() =>
            untracked(() => dirtyChangeSubscription$())?.unsubscribe()
         );
      },
      { injector }
   );

   const pristine$ = computed(() => !dirty$());

   return { dirty$, pristine$, dirtyChangeSubscription$ };
}
