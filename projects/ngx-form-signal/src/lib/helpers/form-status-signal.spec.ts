import { effect, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
   AbstractControl,
   FormArray,
   FormControl,
   FormGroup,
   Validators,
} from '@angular/forms';
import { buildFormStatusSignal } from './form-status-signal';

describe('formStatusSignal', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   function setupForm<T extends AbstractControl | null>(form: T) {
      const form$ = signal<AbstractControl | null>(form);
      const { valid$, invalid$, pending$, disabled$, enabled$, status$ } =
         buildFormStatusSignal(form$, {
            injector,
         });
      TestBed.flushEffects();
      return {
         form$,
         valid$,
         invalid$,
         pending$,
         disabled$,
         enabled$,
         status$,
      };
   }

   it('should reflect initial valid/invalid for a FormControl', () => {
      const control = new FormControl('a', Validators.required);
      const { valid$, invalid$, pending$ } = setupForm(control);

      expect(valid$()).toBe(true);
      expect(invalid$()).toBe(false);
      expect(pending$()).toBe(false);

      control.setValue('');
      TestBed.flushEffects();

      expect(valid$()).toBe(false);
      expect(invalid$()).toBe(true);
   });

   it('should aggregate invalid status in nested FormGroup', () => {
      const form = new FormGroup({
         a: new FormControl('', Validators.required),
         b: new FormControl('ok'),
      });
      const { valid$, invalid$ } = setupForm(form);

      expect(valid$()).toBe(false);
      expect(invalid$()).toBe(true);

      form.controls.a.setValue('filled');
      TestBed.flushEffects();

      expect(valid$()).toBe(true);
      expect(invalid$()).toBe(false);
   });

   it('should aggregate invalid status in FormArray', () => {
      const array = new FormArray([
         new FormControl('', Validators.required),
         new FormControl('ok'),
      ]);
      const { valid$, invalid$ } = setupForm(array);

      expect(valid$()).toBe(false);
      expect(invalid$()).toBe(true);

      array.at(0).setValue('filled');
      TestBed.flushEffects();

      expect(valid$()).toBe(true);
      expect(invalid$()).toBe(false);
   });

   it('should reset status when form is reset', () => {
      const control = new FormControl('', Validators.required);
      const { valid$, invalid$ } = setupForm(control);

      control.setValue('filled');
      TestBed.flushEffects();

      expect(valid$()).toBe(true);

      control.reset();
      TestBed.flushEffects();

      expect(valid$()).toBe(false);
      expect(invalid$()).toBe(true);
   });

   it('should handle null form gracefully', () => {
      const { form$, valid$, invalid$, enabled$, disabled$ } = setupForm(null);

      expect(valid$()).toBe(false);
      expect(invalid$()).toBe(false);

      const control = new FormControl('filled', Validators.required);
      form$.set(control);
      TestBed.flushEffects();

      expect(valid$()).toBe(true);
      expect(invalid$()).toBe(false);
      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);

      control.disable();
      TestBed.flushEffects();
      expect(enabled$()).toBe(false);
      expect(disabled$()).toBe(true);

      form$.set(null);
      TestBed.flushEffects();

      expect(valid$()).toBe(false);
      expect(invalid$()).toBe(false);
   });

   it('should unsubscribe old form when form signal changes', () => {
      const control1 = new FormControl('', Validators.required);
      const control2 = new FormControl('ok', Validators.required);

      const { form$, valid$ } = setupForm(control1);

      expect(valid$()).toBe(false);

      form$.set(control2);
      TestBed.flushEffects();

      expect(valid$()).toBe(true);

      control1.setValue('filled');
      TestBed.flushEffects();

      // Should not affect value
      expect(valid$()).toBe(true);
   });

   it('should emit even if status does not change when eagerNotify is true', () => {
      const control = new FormControl('ok', Validators.required);
      const form$ = signal<AbstractControl | null>(control);

      const { valid$ } = buildFormStatusSignal(form$, {
         injector,
         eagerNotify: true,
      });

      const values: boolean[] = [];
      effect(() => values.push(valid$()), { injector });

      TestBed.flushEffects();
      expect(values).toEqual([true]);

      control.setValue('ok'); // same value, status still valid
      TestBed.flushEffects();

      expect(values).toEqual([true, true]);
   });

   it('should reflect initial enabled/disabled state for FormControl', () => {
      const control = new FormControl('');
      const { enabled$, disabled$ } = setupForm(control);

      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);

      control.disable();
      TestBed.flushEffects();
      expect(enabled$()).toBe(false);
      expect(disabled$()).toBe(true);

      control.enable();
      TestBed.flushEffects();
      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);
   });

   it('should propagate enabled/disabled for FormGroup', () => {
      const form = new FormGroup({
         a: new FormControl(''),
         b: new FormControl(''),
      });
      const { enabled$, disabled$ } = setupForm(form);

      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);

      form.controls.a.disable();
      TestBed.flushEffects();

      // Group is still considered enabled unless all children disabled? Usually Angular treats group as enabled if at least one child enabled
      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);

      form.controls.b.disable();
      TestBed.flushEffects();

      expect(enabled$()).toBe(false);
      expect(disabled$()).toBe(true);

      form.controls.a.enable();
      TestBed.flushEffects();

      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);
   });

   it('should propagate enabled/disabled for FormArray', () => {
      const array = new FormArray([new FormControl(''), new FormControl('')]);
      const { enabled$, disabled$ } = setupForm(array);

      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);

      array.at(0).disable();
      TestBed.flushEffects();
      expect(enabled$()).toBe(true);

      array.at(1).disable();
      TestBed.flushEffects();
      expect(enabled$()).toBe(false);
      expect(disabled$()).toBe(true);

      array.at(0).enable();
      TestBed.flushEffects();
      expect(enabled$()).toBe(true);
      expect(disabled$()).toBe(false);
   });
});
