import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

export type FormFromType<T> = T extends { [K in keyof T]: AbstractControl<any> }
   ? FormGroup<T>
   : FormControl<T>;

export type OptionalFormFromType<T = any> =
   | (T extends { [K in keyof T]: AbstractControl<any> } ? FormGroup<T> : never)
   | FormControl<T>
   | null;
