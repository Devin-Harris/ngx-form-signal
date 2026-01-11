import { Signal } from '@angular/core';
import {
   AbstractControl,
   FormArray,
   FormGroup,
   FormRecord,
} from '@angular/forms';
import { FormSignalForm, FormSignalInput } from './form-signal-options';
import { FormSignal } from './form-signal-type';

type RecursiveControls<T extends AbstractControl> = T extends FormGroup<infer C>
   ? { [K in keyof C]: DeepFormSignal<C[K]> }
   : T extends FormRecord<infer C>
     ? { [x: PropertyKey]: DeepFormSignal<C> }
     : T extends FormArray<infer U>
       ? U extends AbstractControl
          ? DeepFormSignal<U>[]
          : never
       : never;

type SignalControls<T extends AbstractControl | null> = T extends null
   ? Signal<RecursiveControls<NonNullable<T>> | null>
   : Signal<RecursiveControls<NonNullable<T>>>;

type Controls<T extends AbstractControl | null> = T extends null
   ? (RecursiveControls<NonNullable<T>> & SignalControls<T>) | null
   : RecursiveControls<NonNullable<T>> & SignalControls<T>;

type ControlsField<T extends AbstractControl | null> = T extends
   | FormGroup<any>
   | FormArray<any>
   | null
   ? {
        controls: Controls<T>;
     }
   : {};

export type DeepFormSignal<T extends FormSignalInput> = FormSignal<
   NonNullable<FormSignalForm<T>>
> &
   ControlsField<FormSignalForm<T>>;
