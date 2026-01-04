import { computed, Signal, untracked } from '@angular/core';
import {
   AbstractControl,
   FormArray,
   FormGroup,
   FormRecord,
} from '@angular/forms';
import { deepFormSignal } from '../deep-form-signal';
import { formSignal } from '../form-signal';
import { DeepFormSignal } from '../types/deep-form-signal-type';
import { FormSignalOptions } from '../types/form-signal-options';
import { FORM_SIGNAL_FORM_TOKEN } from '../types/form-signal-type';

function buildEagerFormControlsSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const eagerRoot = formSignal(formAsSignal, {
      ...options,
      eagerNotify: true,
   });

   const eagerValueStatus$ = computed(
      () => ({
         value: eagerRoot.value(),
         rawValue: eagerRoot.rawValue(),
         status: eagerRoot.status(),
      }),
      { equal: () => false }
   );

   const controls$ = computed(() => {
      const form = formAsSignal();

      // Recompute controls on status or value change in event of
      // dynamically added/removed controls
      const _ = eagerValueStatus$();

      return untracked(() => {
         if (form instanceof FormArray) {
            return form.controls.map((c) => deepFormSignal(c, options));
         }

         if (form instanceof FormGroup || form instanceof FormRecord) {
            return Object.keys(form.controls).reduce(
               (acc, key) => ({
                  ...acc,
                  [key]: deepFormSignal(form.controls[key], options),
               }),
               {} as { [x: PropertyKey]: DeepFormSignal<any> }
            );
         }

         return null;
      });
   });
   return controls$;
}

type FormSignalsContainer = ReturnType<
   ReturnType<typeof buildEagerFormControlsSignal<any>>
>;

function extractFormInstances(formSignalsContainer: FormSignalsContainer) {
   if (formSignalsContainer === null) return [];
   if (Array.isArray(formSignalsContainer))
      return formSignalsContainer.map((c) => c[FORM_SIGNAL_FORM_TOKEN]());

   return Object.keys(formSignalsContainer).map((key) =>
      formSignalsContainer[key][FORM_SIGNAL_FORM_TOKEN]()
   );
}

export function buildFormControlsSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const eagerControls$ = buildEagerFormControlsSignal(formAsSignal, options);

   // Eventually change this to a linkedSignal  instead of needing the trackedControls and side affects in computed
   const trackedControls: (FormSignalsContainer | null)[] = [];

   const controls$ = computed(() => {
      const controls = eagerControls$();

      trackedControls.push(eagerControls$());
      while (trackedControls.length > 2) {
         trackedControls.shift();
      }

      return untracked(() => {
         const lastControls =
            trackedControls.length === 2 ? trackedControls[0] : null;
         if (!lastControls) {
            trackedControls.push(controls);
            return controls;
         }

         const oldControls: AbstractControl[] =
            extractFormInstances(lastControls);
         const newControls: AbstractControl[] = extractFormInstances(controls);

         const someOldNotInNew = oldControls.some(
            (o) => !newControls.some((n) => n === o)
         );
         const someNewNotInOld = newControls.some(
            (n) => !oldControls.some((o) => o === n)
         );

         if (someOldNotInNew || someNewNotInOld) {
            return controls;
         }

         trackedControls.pop();
         return lastControls;
      });
   });

   return controls$;
}
