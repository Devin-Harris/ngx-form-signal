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

type Controls =
   | {
        [key: string]: AbstractControl;
     }
   | AbstractControl[]
   | null;

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

   const controls$ = computed<Controls>(
      () => {
         const form = formAsSignal();

         // Recompute controls on status or value change in event of
         // dynamically added/removed controls
         const _ = eagerValueStatus$();

         return untracked(() => {
            if (
               form instanceof FormArray ||
               form instanceof FormGroup ||
               form instanceof FormRecord
            ) {
               return form.controls;
            }

            return null;
         });
      },
      { equal: () => false }
   );
   return controls$;
}

function extractFormInstances(
   formSignalsContainer: Controls
): AbstractControl[] {
   if (formSignalsContainer === null) return [];
   if (Array.isArray(formSignalsContainer)) return [...formSignalsContainer];
   return Object.keys(formSignalsContainer).map(
      (key) => formSignalsContainer[key]
   );
}

function buildFlattenedControlsSignal(eagerControls$: Signal<Controls>) {
   const flattenedControls$ = computed(
      () => {
         const controls = eagerControls$();
         return extractFormInstances(controls);
      },
      {
         equal: (a, b) => {
            const someANotInB = a.some(
               (aItem) => !b.some((bItem) => bItem === aItem)
            );
            const someBNotInA = b.some(
               (bItem) => !a.some((aItem) => aItem === bItem)
            );
            return !someANotInB && !someBNotInA;
         },
      }
   );
   return flattenedControls$;
}

function buildDeepSignalsForControls(
   flattenedControls$: Signal<AbstractControl<any, any>[]>,
   options: FormSignalOptions
) {
   // Eventually change this to a linkedSignal instead of needing the lastTrackedControls and side effects in computed
   let lastTrackedControls: {
      control: AbstractControl<any, any>;
      deepFormSignal: DeepFormSignal<any>;
   }[] = [];
   const controlsWithDeepSignals$ = computed(() => {
      const flattenedControls = flattenedControls$();
      return untracked(() => {
         const newTrackedControls: {
            control: AbstractControl<any, any>;
            deepFormSignal: DeepFormSignal<any>;
         }[] = [];
         for (const c of flattenedControls) {
            const match = lastTrackedControls.find((tc) => tc.control === c);
            if (match) {
               newTrackedControls.push(match);
            } else {
               newTrackedControls.push({
                  control: c,
                  deepFormSignal: deepFormSignal(c, options),
               });
            }
         }
         lastTrackedControls = newTrackedControls;
         return lastTrackedControls;
      });
   });
   return controlsWithDeepSignals$;
}

function buildControlsWithDeepSignalsSignal<T extends AbstractControl<any>>(
   controlsWithDeepSignals$: Signal<
      {
         control: AbstractControl<any, any>;
         deepFormSignal: DeepFormSignal<any>;
      }[]
   >,
   formAsSignal: Signal<T | null>
) {
   const controls$ = computed(() => {
      const form = formAsSignal();
      if (!form || !('controls' in form)) return null;

      const controls = form.controls as Controls;
      if (!controls) return null;

      const deepSignals = controlsWithDeepSignals$();

      if (Array.isArray(controls)) {
         return controls.reduce(
            (acc, c) => {
               const match = deepSignals.find((tc) => tc.control === c)
                  ?.deepFormSignal;
               if (match) {
                  acc.push(match);
               }
               return acc;
            },
            [] as DeepFormSignal<(typeof controls)[number]>[]
         );
      }
      return Object.keys(controls).reduce(
         (acc, cKey) => {
            const match = deepSignals.find(
               (tc) => tc.control === controls[cKey]
            );
            if (match && match.deepFormSignal) {
               return { ...acc, [cKey]: match.deepFormSignal };
            }
            return acc;
         },
         {} as {
            [x in keyof typeof controls]: DeepFormSignal<(typeof controls)[x]>;
         }
      );
   });

   return controls$;
}

export function buildFormControlsSignal<T extends AbstractControl<any>>(
   formAsSignal: Signal<T | null>,
   options: FormSignalOptions
) {
   const eagerControls$ = buildEagerFormControlsSignal(formAsSignal, options);
   const flattenedControls$ = buildFlattenedControlsSignal(eagerControls$);
   const controlsWithDeepSignals$ = buildDeepSignalsForControls(
      flattenedControls$,
      options
   );
   const controls$ = buildControlsWithDeepSignalsSignal(
      controlsWithDeepSignals$,
      formAsSignal
   );

   return controls$;
}
