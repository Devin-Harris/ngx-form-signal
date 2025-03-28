import {
   AbstractControl,
   FormArray,
   FormControl,
   FormGroup,
} from '@angular/forms';

export type FormFromType<T> = T extends { [K in keyof T]: AbstractControl<any> }
   ? FormGroup<T>
   : T extends AbstractControl<any>
     ? FormArray<T>
     : T extends AbstractControl<any>[]
       ? FormArray<T[0]>
       : FormControl<T>;

export type OptionalFormFromType<T = any> =
   | FormFromType<T>
   | FormControl<T>
   | null;
