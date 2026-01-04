import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { FormSignalForm, FormSignalInput } from './form-signal-options';
import { FormSignal } from './form-signal-type';

type Controls<T extends AbstractControl> = T extends FormGroup<infer C>
   ? { [K in keyof C]: DeepFormSignal<C[K]> }
   : T extends FormArray<infer U>
     ? U extends AbstractControl
        ? DeepFormSignal<U>[]
        : never
     : never;

type ControlsField<T extends AbstractControl | null> = T extends
   | FormGroup<any>
   | FormArray<any>
   | null
   ? T extends null
      ? { controls?: Controls<NonNullable<T>> | null }
      : { controls: Controls<NonNullable<T>> }
   : {};

export type DeepFormSignal<T extends FormSignalInput> = FormSignal<
   NonNullable<FormSignalForm<T>>
> &
   ControlsField<FormSignalForm<T>>;
