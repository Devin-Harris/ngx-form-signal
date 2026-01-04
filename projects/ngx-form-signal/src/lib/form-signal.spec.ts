import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { formSignal } from './form-signal';

describe('formSignal Integration', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   it('should track all signals from formSignal', () => {
      const form = new FormGroup({
         name: new FormControl('', Validators.required),
         age: new FormControl(0),
      });

      const fSignal = formSignal(form, { injector });
      TestBed.flushEffects();

      // initial state
      expect(fSignal.value()).toEqual({ name: '', age: 0 });
      expect(fSignal.rawValue()).toEqual({ name: '', age: 0 });
      expect(fSignal.touched()).toBe(false);
      expect(fSignal.dirty()).toBe(false);
      expect(fSignal.enabled()).toBe(true);
      expect(fSignal.errors()).toBeNull();

      // update control values
      form.controls.name.setValue('Alice');
      form.controls.name.markAsDirty();
      form.controls.age.setValue(30);
      form.controls.age.markAsDirty();
      TestBed.flushEffects();

      expect(fSignal.value()).toEqual({ name: 'Alice', age: 30 });
      expect(fSignal.rawValue()).toEqual({ name: 'Alice', age: 30 });
      expect(fSignal.dirty()).toBe(true);
      expect(fSignal.errors()).toBeNull();

      // mark touched
      form.controls.name.markAsTouched();
      TestBed.flushEffects();
      expect(fSignal.touched()).toBe(true);

      // disable control
      form.controls.name.disable();
      TestBed.flushEffects();
      expect(fSignal.enabled()).toBe(true);
   });

   it('should handle null form and rebinding', () => {
      const form$ = signal<FormGroup | null>(null);
      const fSignal = formSignal(form$, { injector });
      TestBed.flushEffects();

      expect(fSignal.value()).toBeNull();
      expect(fSignal.rawValue()).toBeNull();
      expect(fSignal.touched()).toBe(false);
      expect(fSignal.dirty()).toBe(false);
      expect(fSignal.enabled()).toBe(true);
      expect(fSignal.errors()).toBeNull();

      const form = new FormGroup({
         name: new FormControl('', Validators.required),
      });
      form$.set(form);
      TestBed.flushEffects();

      expect(fSignal.value()).toEqual({ name: '' });
      expect(fSignal.errors()).toBeNull();

      form$.set(null);
      TestBed.flushEffects();

      expect(fSignal.value()).toBeNull();
      expect(fSignal.rawValue()).toBeNull();
      expect(fSignal.touched()).toBe(false);
      expect(fSignal.dirty()).toBe(false);
      expect(fSignal.enabled()).toBe(true);
      expect(fSignal.errors()).toBeNull();
   });
});
