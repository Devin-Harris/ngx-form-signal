import { effect, Signal, untracked } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { FormSignalOptions } from '../types/form-signal-options';

export function handleStreamSignal<T extends AbstractControl<any>, StreamValue>(
   formStream: Signal<{ form: T | null; stream: Observable<StreamValue> }>,
   callback: (form: T | null, streamValue?: StreamValue) => void,
   options: FormSignalOptions
) {
   let streamSubscription: Subscription | null = null;
   return effect(
      (onCleanup: Function) => {
         const { form, stream } = formStream();
         untracked(() => {
            callback(form);

            streamSubscription?.unsubscribe();
            streamSubscription = stream.subscribe((streamValue) => {
               callback(form, streamValue);
            });
         });
         onCleanup(() => {
            streamSubscription?.unsubscribe();
         });
      },
      { injector: options.injector }
   );
}
