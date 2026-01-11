import { effect, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
   AbstractControl,
   FormArray,
   FormControl,
   FormGroup,
} from '@angular/forms';
import { buildFormDirtySignal } from './form-dirty-signal';

describe('formDirtySignal', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   function setupForm<T extends AbstractControl | null>(form: T) {
      const form$ = signal<AbstractControl | null>(form);
      const { dirty$, pristine$ } = buildFormDirtySignal(form$, { injector });
      TestBed.flushEffects();
      return { form$, dirty$, pristine$ };
   }

   it('should initially be false for dirty and true for pristine', () => {
      const control = new FormControl('');
      const { dirty$, pristine$ } = setupForm(control);

      expect(dirty$()).toBe(false);
      expect(pristine$()).toBe(true);
   });

   it('should become dirty when FormControl value changes', () => {
      const control = new FormControl('');
      const { dirty$, pristine$ } = setupForm(control);

      control.markAsDirty();
      TestBed.flushEffects();

      expect(dirty$()).toBe(true);
      expect(pristine$()).toBe(false);
   });

   it('should reflect dirty if any nested FormControl is dirty', () => {
      const form = new FormGroup({
         a: new FormControl(''),
         b: new FormControl(''),
      });
      const { dirty$ } = setupForm(form);

      expect(dirty$()).toBe(false);

      form.controls.a.markAsDirty();
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);

      form.controls.a.markAsPristine();
      TestBed.flushEffects();
      expect(dirty$()).toBe(false);

      form.controls.b.markAsDirty();
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);
   });

   it('should reflect dirty if any FormArray control is dirty', () => {
      const array = new FormArray([new FormControl(''), new FormControl('')]);
      const { dirty$ } = setupForm(array);

      expect(dirty$()).toBe(false);

      array.at(1).markAsDirty();
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);
   });

   it('should reset to pristine when form is reset', () => {
      const form = new FormGroup({
         a: new FormControl(''),
      });
      const { dirty$, pristine$ } = setupForm(form);

      form.controls.a.markAsDirty();
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);
      expect(pristine$()).toBe(false);

      form.reset();
      TestBed.flushEffects();
      expect(dirty$()).toBe(false);
      expect(pristine$()).toBe(true);
   });

   it('should handle null form gracefully', () => {
      const { form$, dirty$, pristine$ } = setupForm(null);

      expect(dirty$()).toBe(false);
      expect(pristine$()).toBe(true);

      const control = new FormControl('');
      form$.set(control);
      TestBed.flushEffects();

      expect(dirty$()).toBe(false);
      expect(pristine$()).toBe(true);

      control.markAsDirty();
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);
      expect(pristine$()).toBe(false);

      form$.set(null);
      TestBed.flushEffects();
      expect(dirty$()).toBe(false);
      expect(pristine$()).toBe(true);
   });

   it('should unsubscribe old form when form signal changes', () => {
      const control1 = new FormControl('');
      const control2 = new FormControl('');

      const { form$, dirty$ } = setupForm(control1);

      control1.markAsDirty();
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);

      form$.set(control2);
      TestBed.flushEffects();
      expect(dirty$()).toBe(false);

      control1.markAsDirty(); // old control
      TestBed.flushEffects();
      expect(dirty$()).toBe(false);

      control2.markAsDirty(); // new control
      TestBed.flushEffects();
      expect(dirty$()).toBe(true);
   });

   it('should emit even if dirty state does not change when eagerNotify is true', () => {
      const control = new FormControl('');
      const form$ = signal<AbstractControl | null>(control);

      const { dirty$ } = buildFormDirtySignal(form$, {
         injector,
         eagerNotify: true,
      });

      const values: boolean[] = [];
      effect(() => values.push(dirty$()), { injector });

      TestBed.flushEffects();
      expect(values).toEqual([false]);

      // Set same value again
      control.markAsDirty();
      control.markAsPristine();
      TestBed.flushEffects();
      expect(values).toEqual([false, false]);
   });
});
