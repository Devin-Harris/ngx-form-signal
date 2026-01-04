import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { deepFormSignal } from './deep-form-signal';

describe('deepFormSignal Integration', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   it('should track all signals from deepFormSignal and handle nullable .controls', async () => {
      const form$ = signal<FormGroup<{
         name: FormControl<string | null>;
         age: FormControl<number | null>;
      }> | null>(null);
      const dSignal = deepFormSignal(form$, { injector });
      TestBed.flushEffects();

      expect(dSignal.controls).toBeNull();
      expect(dSignal.value()).toBeNull();

      const form = new FormGroup({
         name: new FormControl('', Validators.required),
         age: new FormControl(1),
      });

      form$.set(form);
      TestBed.flushEffects();
      let controls = dSignal.controls;
      TestBed.flushEffects();

      expect(dSignal.value()).toEqual({ name: '', age: 1 });
      expect(dSignal.errors()).toEqual(null);

      expect(controls).toBeDefined();
      expect(controls!.name.value()).toEqual('');
      expect(controls!.name.dirty()).toBe(false);
      expect(controls!.name.errors()).toEqual({ required: true });
      expect(controls!.age.value()).toEqual(1);
      expect(controls!.age.dirty()).toBe(false);
      expect(controls!.age.errors()).toEqual(null);

      // update values
      form.controls.name.setValue('Alice');
      form.controls.age.setValue(30);
      TestBed.flushEffects();

      expect(dSignal.value()).toEqual({ name: 'Alice', age: 30 });
      expect(controls!.name.value()).toEqual('Alice');
      expect(controls!.name.errors()).toEqual(null);
      expect(controls!.age.value()).toEqual(30);
      expect(controls!.age.errors()).toEqual(null);

      // mark touched
      form.controls.name.markAsTouched();
      TestBed.flushEffects();
      controls = dSignal.controls;
      TestBed.flushEffects();
      expect(dSignal.touched()).toBe(true);
      expect(controls!.name.touched()).toBe(true);

      // disable control
      form.controls.name.disable();
      TestBed.flushEffects();
      controls = dSignal.controls;
      TestBed.flushEffects();
      expect(dSignal.enabled()).toBe(true);
      expect(controls!.name.enabled()).toBe(false);

      // back to null
      form$.set(null);
      TestBed.flushEffects();
      controls = dSignal.controls;
      TestBed.flushEffects();

      expect(controls).toBeNull();
      expect(dSignal.value()).toBeNull();
      expect(dSignal.errors()).toBeNull();
   });
});
