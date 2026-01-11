import { effect, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { deepFormSignal } from '../deep-form-signal';

describe('form-controls-signal (deep stability)', () => {
   let injector: Injector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
   });

   function setup<T extends FormGroup<any>>(form: T) {
      const form$ = signal<T>(form);
      const dSignal = deepFormSignal(form$, { injector });
      TestBed.flushEffects();
      return { form$, dSignal };
   }

   it('should not rerun effects when sibling controls are added or removed (stable deep access)', () => {
      const form = new FormGroup({
         address: new FormGroup({
            zip: new FormControl('12345'),
         }),
      });

      const { dSignal } = setup(form);

      let runs = 0;

      effect(
         () => {
            runs++;
            dSignal.controls.address.controls.zip.value();
         },
         { injector }
      );

      TestBed.flushEffects();
      expect(runs).toBe(1);

      // add sibling control
      (form.controls.address as FormGroup).addControl('street', new FormControl('Main St'));
      TestBed.flushEffects();

      expect(runs).toBe(1);

      // remove sibling control
      (form.controls.address as FormGroup).removeControl('street');
      TestBed.flushEffects();

      expect(runs).toBe(1);
   });

   it('should rerun effects when using snapshot controls() access', () => {
      const form = new FormGroup({
         address: new FormGroup({
            zip: new FormControl('12345'),
         }),
      });

      const { dSignal } = setup(form);

      let runs = 0;

      effect(
         () => {
            runs++;
            dSignal.controls.address.controls().zip.value();
         },
         { injector }
      );

      TestBed.flushEffects();
      expect(runs).toBe(1);

      (form.controls.address as FormGroup).addControl('street', new FormControl('Main St'));
      TestBed.flushEffects();

      expect(runs).toBe(2);

      (form as FormGroup).addControl('test', new FormControl('Main St'));
      TestBed.flushEffects();

      expect(runs).toBe(2);

      (form.controls.address as FormGroup).removeControl('street');
      TestBed.flushEffects();

      expect(runs).toBe(3);
   });

   it('should rerun effects when dynamically adding controls', () => {
      const zip = new FormControl('12345');
      const form = new FormGroup({
         address: new FormGroup({
            zip,
         }),
      });

      const { dSignal } = setup(form);

      let runs = 0;

      effect(
         () => {
            runs++;
            dSignal.controls.address.controls.zip?.value();
         },
         { injector }
      );

      TestBed.flushEffects();
      expect(runs).toBe(1);

      (form.controls.address as FormGroup).removeControl('zip');
      TestBed.flushEffects();

      expect(runs).toBe(1);

      (form.controls.address as FormGroup).addControl('zip', zip);
      TestBed.flushEffects();

      expect(runs).toBe(1);

      zip.setValue('123456');
      TestBed.flushEffects();

      expect(runs).toBe(2);
   });

   it('should preserve deep signal identity when controls change', () => {
      const form = new FormGroup({
         address: new FormGroup({
            zip: new FormControl('12345'),
         }),
      });

      const { dSignal } = setup(form);

      const zipSignalBefore = dSignal.controls.address.controls.zip;

      (form.controls.address as FormGroup).addControl('street', new FormControl('Main St'));
      TestBed.flushEffects();

      const zipSignalAfter = dSignal.controls.address.controls.zip;

      expect(zipSignalAfter).toBe(zipSignalBefore);
   });

   it('should remove deep signals when controls are removed', () => {
      const form = new FormGroup({
         address: new FormGroup({
            zip: new FormControl('12345'),
         }),
      });

      const { dSignal } = setup(form);

      expect(dSignal.controls.address.controls.zip).toBeDefined();

      (form.controls.address as FormGroup).removeControl('zip');
      TestBed.flushEffects();

      expect(dSignal.controls.address.controls.zip).toBeUndefined();
   });

   it('should create deep signals for dynamically added controls', () => {
      const form = new FormGroup({
         address: new FormGroup<{ zip?: FormControl<string | null> }>({}),
      });

      const { dSignal } = setup(form);

      expect(dSignal.controls.address.controls.zip).toBeUndefined();

      (form.controls.address as FormGroup).addControl('zip', new FormControl('90210'));
      TestBed.flushEffects();
      const controls = dSignal.controls.address.controls();
      TestBed.flushEffects();

      expect(controls.zip?.value()).toBe('90210');
   });
});
