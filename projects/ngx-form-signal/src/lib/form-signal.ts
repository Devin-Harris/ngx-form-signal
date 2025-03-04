import {
   assertInInjectionContext,
   isSignal,
   Signal,
   signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { buildFormDirtySignal } from './helpers/form-dirty-signal';
import { buildFormErrorSignal } from './helpers/form-error-signal';
import { buildFormSnapshotSignal } from './helpers/form-snapshot-signal';
import { buildFormStatusSignal } from './helpers/form-status-signal';
import { buildFormTouchedSignal } from './helpers/form-touched-signal';
import { buildFormValueSignal } from './helpers/form-value-signal';
import {
   buildDefaultFormSignalOptions,
   FormSignalOptions,
} from './types/form-signal-options';
import {
   DeepFormSignal,
   FormSignal,
   FormSignalState,
} from './types/form-signal-type';
import { OptionalFormFromType } from './types/form-type';

export function formSignal<T = any>(
   form: Signal<OptionalFormFromType<T>> | OptionalFormFromType<T>,
   options: FormSignalOptions = buildDefaultFormSignalOptions<T>()
): FormSignal<T> {
   const formAsSignal = isSignal(form) ? form : signal(form);
   if (!options.injector) {
      assertInInjectionContext(() => {});
   }
   const { value$, rawValue$, valueChangeSubscription$ } =
      buildFormValueSignal<T>(formAsSignal, options);
   const {
      status$,
      valid$,
      invalid$,
      pending$,
      disabled$,
      enabled$,
      statusChangeSubscription$,
   } = buildFormStatusSignal<T>(formAsSignal, options);
   const { touched$, untouched$, touchedChangeSubscription$ } =
      buildFormTouchedSignal(formAsSignal, options);
   const { dirty$, pristine$, dirtyChangeSubscription$ } = buildFormDirtySignal(
      formAsSignal,
      options
   );
   const errors$ = buildFormErrorSignal(formAsSignal, value$, status$, options);

   const formSignals: FormSignalState<T> = {
      status: status$.asReadonly(),
      value: value$.asReadonly(),
      rawValue: rawValue$.asReadonly(),
      touched: touched$.asReadonly(),
      untouched: untouched$,
      dirty: dirty$.asReadonly(),
      pristine: pristine$,
      valid: valid$,
      invalid: invalid$,
      pending: pending$,
      disabled: disabled$,
      enabled: enabled$,
      errors: errors$,
      subscriptions: {
         valueChangeSubscription: valueChangeSubscription$.asReadonly(),
         statusChangeSubscription: statusChangeSubscription$.asReadonly(),
         touchedChangeSubscription: touchedChangeSubscription$.asReadonly(),
         dirtyChangeSubscription: dirtyChangeSubscription$.asReadonly(),
      },
   };

   const snapshot$ = buildFormSnapshotSignal(formSignals);
   const formSignalObj = (() => snapshot$()) as FormSignal<T>;

   Object.setPrototypeOf(formSignalObj, formSignals);

   return formSignalObj;
}

// TODO: Cleanup ts-ignores and add recursive snapshots for deep signals
export function deepFormSignal<T = any>(
   form: Signal<OptionalFormFromType<T>> | OptionalFormFromType<T>,
   options: FormSignalOptions = buildDefaultFormSignalOptions<T>()
): DeepFormSignal<T> {
   const root: DeepFormSignal<T> = formSignal<T>(
      form,
      options
   ) as DeepFormSignal<T>;
   if (form instanceof FormControl) {
      return root;
   } else {
      const f = isSignal(form) ? form() : form;
      if (f) {
         let children: DeepFormSignal<T>['children'] | null = null;
         if (f instanceof FormArray) {
            const controls = f.controls as (FormControl | FormGroup)[];
            children = controls.reduce(
               (acc, c, i) => {
                  // @ts-ignore
                  acc[i] = deepFormSignal(c, options);
                  return acc;
               },
               {} as DeepFormSignal<T>['children']
            );
         } else if (f instanceof FormGroup) {
            const controls = f.controls;
            children = Object.keys(controls).reduce(
               (acc, cKey) => {
                  // @ts-ignore
                  const control = controls[cKey] as
                     | FormControl
                     | FormGroup
                     | FormArray;
                  // @ts-ignore
                  acc[cKey] = deepFormSignal(control, options);
                  return acc;
               },
               {} as DeepFormSignal<T>['children']
            );
         }

         if (children) {
            root.children = children;
         }
      }
   }

   return root;
}
