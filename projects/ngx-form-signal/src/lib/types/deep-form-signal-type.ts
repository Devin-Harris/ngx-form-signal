import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormSignal } from './form-signal-type';
import { FormFromType } from './form-type';

type DeepFormSignalNestedHelper<T, K> = FormFromType<T> extends
   | FormGroup
   | FormArray
   ? K extends keyof FormFromType<T>['controls']
      ? FormFromType<T>['controls'][K] extends FormControl
         ? FormSignal<FormFromType<T>['controls'][K]['value']>
         : FormFromType<T>['controls'][K] extends FormGroup
           ? DeepFormSignal<FormFromType<T>['controls'][K]['controls']>
           : FormFromType<T>['controls'][K] extends FormArray
             ? DeepFormSignal<FormFromType<T>['controls'][K]['controls']>
             : never
      : never
   : never;

export type DeepFormSignalChildren<T = any> =
   FormFromType<T> extends FormControl
      ? FormSignal<T>
      : FormFromType<T> extends FormGroup
        ? FormFromType<T>['controls'] extends Array<any>
           ? {
                [K: number]: DeepFormSignalNestedHelper<T, number>;
             }
           : {
                [K in keyof FormFromType<T>['controls']]: DeepFormSignalNestedHelper<
                   T,
                   K
                >;
             }
        : FormFromType<T> extends FormArray
          ? {
               [K: number]: DeepFormSignalNestedHelper<T, number>;
            }
          : null;

export type DeepFormSignal<T = any> = FormSignal<T> &
   (FormFromType<T> extends FormControl
      ? { children: null }
      : {
           children: DeepFormSignalChildren<T>;
        });
