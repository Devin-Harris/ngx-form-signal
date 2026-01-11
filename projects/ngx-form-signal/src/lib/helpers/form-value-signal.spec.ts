import { effect, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
   AbstractControl,
   FormArray,
   FormControl,
   FormGroup,
} from '@angular/forms';
import { buildFormValueSignal } from './form-value-signal';

describe('formValueSignal', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   function setupForm<T extends AbstractControl | null>(form: T) {
      const form$ = signal<AbstractControl | null>(form);
      const { value$, rawValue$ } = buildFormValueSignal(form$, { injector });
      TestBed.flushEffects();
      return { form$, value$, rawValue$ };
   }

   it('should reflect the initial FormControl value', () => {
      const control = new FormControl('a');

      const { value$ } = setupForm(control);

      expect(value$()).toBe('a');
   });

   it('should update when FormControl value changes', () => {
      const control = new FormControl('a');

      const { value$ } = setupForm(control);

      control.setValue('b');
      expect(value$()).toBe('b');
   });

   it('should update when FormControl is reset', () => {
      const control = new FormControl('a');

      const { value$ } = setupForm(control);

      control.reset();
      expect(value$()).toBeNull();
   });

   it('should reflect initial FormGroup value', () => {
      const form = new FormGroup({
         name: new FormControl('Alice'),
         age: new FormControl(30),
      });

      const { value$ } = setupForm(form);

      expect(value$()).toEqual({
         name: 'Alice',
         age: 30,
      });
   });

   it('should update when FormGroup is patched', () => {
      const form = new FormGroup({
         name: new FormControl('Alice'),
         age: new FormControl(30),
      });

      const { value$ } = setupForm(form);

      form.patchValue({ age: 31 });

      expect(value$()).toEqual({
         name: 'Alice',
         age: 31,
      });
   });

   it('should update when nested FormControl changes', () => {
      const form = new FormGroup({
         profile: new FormGroup({
            name: new FormControl('Alice'),
         }),
      });

      const { value$ } = setupForm(form);

      form.controls.profile.controls.name.setValue('Bob');

      expect(value$()).toEqual({
         profile: { name: 'Bob' },
      });
   });

   it('should reflect initial FormArray value', () => {
      const array = new FormArray([new FormControl('a'), new FormControl('b')]);

      const { value$ } = setupForm(array);

      expect(value$()).toEqual(['a', 'b']);
   });

   it('should update when FormArray structure changes', () => {
      const array = new FormArray([new FormControl('a')]);

      const { value$ } = setupForm(array);

      array.push(new FormControl('b'));
      expect(value$()).toEqual(['a', 'b']);

      array.removeAt(0);
      expect(value$()).toEqual(['b']);
   });

   it('should unsubscribe from the previous form when form signal changes', () => {
      const control1 = new FormControl('a');
      const control2 = new FormControl('x');

      const { value$, form$ } = setupForm(control1);

      control1.setValue('b');
      expect(value$()).toBe('b');

      form$.set(control2);
      TestBed.flushEffects();

      control1.setValue('SHOULD_NOT_EMIT');
      expect(value$()).toBe('x');

      control2.setValue('y');
      expect(value$()).toBe('y');
   });

   it('should handle null form initially and when changed', () => {
      const { value$, form$, rawValue$ } = setupForm(null);

      // Initially null
      expect(value$()).toBeNull();
      expect(rawValue$()).toBeNull();

      // Set to a real FormControl
      const control = new FormControl('a');
      form$.set(control);
      TestBed.flushEffects();

      expect(value$()).toBe('a');
      expect(rawValue$()).toBe('a');

      // Back to null
      form$.set(null);
      TestBed.flushEffects();

      expect(value$()).toBeNull();
      expect(rawValue$()).toBeNull();
   });

   it('should emit value even if the reference does not change when eagerNotify is true', () => {
      const control = new FormControl(1);
      const form$ = signal<AbstractControl | null>(control);
      const { value$ } = buildFormValueSignal(form$, {
         injector,
         eagerNotify: true,
      });

      const values: any[] = [];
      effect(
         () => {
            values.push(value$());
         },
         { injector }
      );

      TestBed.flushEffects();
      expect(values).toEqual([1]);

      // Set the same value
      control.setValue(1);
      TestBed.flushEffects();

      expect(values).toEqual([1, 1]);
   });

   it('should not update value$ when setValue with emitEvent: false', () => {
      const control = new FormControl('initial');
      const { value$ } = setupForm(control);

      control.setValue('new value', { emitEvent: false });
      TestBed.flushEffects();

      expect(value$()).toBe('initial'); // No emission
   });

   it('should not update value$ when patchValue with emitEvent: false on FormGroup', () => {
      const form = new FormGroup({
         a: new FormControl('x'),
         b: new FormControl('y'),
      });
      const { value$ } = setupForm(form);

      form.patchValue({ a: 'z' }, { emitEvent: false });
      TestBed.flushEffects();

      expect(value$()).toEqual({ a: 'x', b: 'y' }); // No emission
   });

   it('rawValue$ should include disabled controls', () => {
      const form = new FormGroup({
         enabled: new FormControl('e'),
         disabled: new FormControl('d'),
      });
      form.controls.disabled.disable();

      const { value$, rawValue$ } = setupForm(form);

      expect(value$()).toEqual({ enabled: 'e' }); // disabled excluded
      expect(rawValue$()).toEqual({ enabled: 'e', disabled: 'd' }); // disabled included

      form.controls.disabled.enable();
      expect(value$()).toEqual({ enabled: 'e', disabled: 'd' });
      expect(rawValue$()).toEqual({ enabled: 'e', disabled: 'd' });
   });
});
