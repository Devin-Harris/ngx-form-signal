import { Signal } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { FormSignal } from './form-signal-type';

type Controls<T extends AbstractControl> =
   T extends FormGroup<infer C>
      ? { [K in keyof C]: DeepFormSignal<C[K]> }
      : T extends FormArray<infer U>
        ? U extends AbstractControl
           ? DeepFormSignal<U>[]
           : never
        : never;

type ControlsField<T extends AbstractControl | null> = T extends FormGroup<any> | FormArray<any> | null
   ? T extends null
      ? { controls?: Controls<NonNullable<T>> | null }
      : { controls: Controls<NonNullable<T>> }
   : {};

export type DeepSignalForm<T extends DeepSignalFormInput> = T extends Signal<infer P> ? P : T;

export type DeepSignalFormInput = AbstractControl | Signal<AbstractControl> | Signal<AbstractControl | null>;

export type DeepFormSignal<T extends DeepSignalFormInput> = FormSignal<NonNullable<DeepSignalForm<T>>> &
   ControlsField<DeepSignalForm<T>>;
