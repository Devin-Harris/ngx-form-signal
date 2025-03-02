import { effect, Signal, signal, untracked } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';
import { FormFromType, OptionalFormFromType } from '../types/form-type';

export function buildFormValueSignal<T = any>(
   formAsSignal: Signal<OptionalFormFromType<T>>,
   options: FormSignalOptions<T>
) {
   const value$ = signal<FormFromType<T>['value'] | null>(
      formAsSignal()?.value ?? null,
      { equal: options.equalityFns?.valueEquality ?? (() => false) }
   );
   const rawValue$ = signal<FormFromType<T>['value'] | null>(
      formAsSignal()?.getRawValue() ?? null,
      {
         equal: options.equalityFns?.valueEquality ?? (() => false),
      }
   );
   const valueChangeSubscription$ = signal<Subscription | null>(null);
   const formValueChangeEffect = effect(
      (onCleanup: Function) => {
         const form = formAsSignal() as AbstractControl<T> | null;
         untracked(() => {
            const setValue = () => {
               untracked(() => {
                  value$.set(form?.value ?? null);
                  rawValue$.set(form?.getRawValue() ?? null);
               });
            };

            valueChangeSubscription$()?.unsubscribe();
            valueChangeSubscription$.set(
               form?.valueChanges.subscribe(() => {
                  setValue();
               }) ?? null
            );
            setValue();
         });
         onCleanup(
            () => untracked(() => valueChangeSubscription$())?.unsubscribe()
         );
      },
      { injector: options.injector }
   );
   return { value$, rawValue$, valueChangeSubscription$ };
}
