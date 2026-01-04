import { effect, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { buildFormErrorSignal } from './form-error-signal';

describe('formErrorSignal', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   function setupForm<T extends AbstractControl | null>(form: T) {
      const form$ = signal<AbstractControl | null>(form);
      const errors$ = buildFormErrorSignal(form$, { injector });
      TestBed.flushEffects();
      return { form$, errors$ };
   }

   it('should reflect initial validation errors for FormControl', () => {
      const control = new FormControl('', Validators.required);
      const { errors$ } = setupForm(control);

      expect(errors$()).toEqual({ required: true });

      control.setValue('filled');
      TestBed.flushEffects();

      expect(errors$()).toBeNull();
   });

   it('should handle null form gracefully', () => {
      const { form$, errors$ } = setupForm(null);

      expect(errors$()).toBeNull();

      const control = new FormControl('', Validators.required);
      form$.set(control);
      TestBed.flushEffects();

      expect(errors$()).toEqual({ required: true });

      control.setValue('ok');
      TestBed.flushEffects();
      expect(errors$()).toBeNull();

      form$.set(null);
      TestBed.flushEffects();
      expect(errors$()).toBeNull();
   });

   it('should unsubscribe old form when form signal changes', () => {
      const control1 = new FormControl('', Validators.required);
      const control2 = new FormControl('ok', Validators.required);

      const { form$, errors$ } = setupForm(control1);

      expect(errors$()).toEqual({ required: true });

      form$.set(control2);
      TestBed.flushEffects();

      expect(errors$()).toBeNull();

      control1.setValue('filled');
      TestBed.flushEffects();

      expect(errors$()).toBeNull();
   });

   it('should emit even if error state does not change when eagerNotify is true', () => {
      const errors = { test: true };
      const control = new FormControl('');
      control.setErrors(errors);
      const form$ = signal<AbstractControl | null>(control);

      const errors$ = buildFormErrorSignal(form$, {
         injector,
         eagerNotify: true,
      });

      const values: Array<any> = [];
      effect(() => values.push(errors$()), { injector });

      TestBed.flushEffects();
      expect(values).toEqual([errors]);

      // set the same value, errors unchanged
      control.setErrors(errors);
      TestBed.flushEffects();

      expect(values).toEqual([errors, errors]);
   });

   it('should not emit  if error state does not change when eagerNotify is false', () => {
      const errors = { test: true };
      const control = new FormControl('');
      control.setErrors(errors);
      const form$ = signal<AbstractControl | null>(control);

      const errors$ = buildFormErrorSignal(form$, {
         injector,
         eagerNotify: false,
      });

      const values: Array<any> = [];
      effect(() => values.push(errors$()), { injector });

      TestBed.flushEffects();
      expect(values).toEqual([errors]);

      // set the same value, errors unchanged
      control.setErrors(errors);
      TestBed.flushEffects();

      expect(values).toEqual([errors]);
   });
});
