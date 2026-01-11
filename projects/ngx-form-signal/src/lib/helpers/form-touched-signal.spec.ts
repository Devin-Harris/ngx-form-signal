import { effect, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
   AbstractControl,
   FormArray,
   FormControl,
   FormGroup,
} from '@angular/forms';
import { buildFormTouchedSignal } from './form-touched-signal';

describe('formTouchedSignal', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   function setupForm<T extends AbstractControl | null>(form: T) {
      const form$ = signal<AbstractControl | null>(form);
      const { touched$, untouched$ } = buildFormTouchedSignal(form$, {
         injector,
      });
      TestBed.flushEffects();
      return { form$, touched$, untouched$ };
   }

   it('should initially be false for a FormControl', () => {
      const control = new FormControl('');
      const { touched$, untouched$ } = setupForm(control);

      expect(touched$()).toBe(false);
      expect(untouched$()).toBe(true);
   });

   it('should become true when FormControl is marked as touched', () => {
      const control = new FormControl('');
      const { touched$, untouched$ } = setupForm(control);

      control.markAsTouched();
      TestBed.flushEffects();

      expect(touched$()).toBe(true);
      expect(untouched$()).toBe(false);
   });

   it('should reflect touched if any nested FormControl is touched', () => {
      const form = new FormGroup({
         a: new FormControl(''),
         b: new FormControl(''),
      });
      const { touched$ } = setupForm(form);

      expect(touched$()).toBe(false);

      form.controls.a.markAsTouched();
      TestBed.flushEffects();

      expect(touched$()).toBe(true);

      // b untouched does not reset signal
      form.controls.b.setValue('x');
      TestBed.flushEffects();
      expect(touched$()).toBe(true);
   });

   it('should reflect touched if any FormArray control is touched', () => {
      const array = new FormArray([new FormControl(''), new FormControl('')]);
      const { touched$ } = setupForm(array);

      expect(touched$()).toBe(false);

      array.at(1).markAsTouched();
      TestBed.flushEffects();

      expect(touched$()).toBe(true);
   });

   it('should reset to false when form is reset', () => {
      const form = new FormGroup({
         a: new FormControl(''),
      });
      const { touched$ } = setupForm(form);

      form.controls.a.markAsTouched();
      TestBed.flushEffects();
      expect(touched$()).toBe(true);

      form.reset();
      TestBed.flushEffects();
      expect(touched$()).toBe(false);
   });

   it('should handle null form gracefully', () => {
      const { form$, touched$ } = setupForm(null);

      expect(touched$()).toBe(false);

      const control = new FormControl('');
      form$.set(control);
      TestBed.flushEffects();

      expect(touched$()).toBe(false);

      control.markAsTouched();
      TestBed.flushEffects();
      expect(touched$()).toBe(true);

      form$.set(null);
      TestBed.flushEffects();
      expect(touched$()).toBe(false);
   });

   it('should unsubscribe from old form when form signal changes', () => {
      const control1 = new FormControl('');
      const control2 = new FormControl('');

      const { touched$, form$ } = setupForm(control1);

      control1.markAsTouched();
      TestBed.flushEffects();
      expect(touched$()).toBe(true);

      form$.set(control2);
      TestBed.flushEffects();

      // Mark old control touched again, should not emit
      control1.markAsTouched();
      TestBed.flushEffects();
      expect(touched$()).toBe(false);

      // Mark new control touched
      control2.markAsTouched();
      TestBed.flushEffects();
      expect(touched$()).toBe(true);
   });

   it('should emit even if touched state does not change when eagerNotify is true', () => {
      const control = new FormControl('');
      const form$ = signal<AbstractControl | null>(control);

      const { touched$ } = buildFormTouchedSignal(form$, {
         injector,
         eagerNotify: true,
      });

      const values: boolean[] = [];
      effect(() => values.push(touched$()), { injector });

      TestBed.flushEffects();
      expect(values).toEqual([false]);

      // To touched then back to untouched in same cd cycle should emit with eagerNotify
      control.markAsTouched();
      control.markAsUntouched();
      TestBed.flushEffects();
      expect(values).toEqual([false, false]);
   });
});
