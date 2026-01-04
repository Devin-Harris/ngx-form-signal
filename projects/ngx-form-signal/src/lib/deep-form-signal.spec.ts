import { Component, Injector, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
   FormArray,
   FormControl,
   FormGroup,
   FormRecord,
   Validators,
} from '@angular/forms';
import { deepFormSignal } from './deep-form-signal';

@Component({
   standalone: true,
   template: '',
})
class TestComponent {
   readonly form = input.required<
      FormGroup<{
         name: FormControl<string>;
      }>
   >();

   readonly dSignal = deepFormSignal(this.form);
}

describe('deepFormSignal Integration', () => {
   let injector: Injector;
   let fixture: ComponentFixture<TestComponent>;

   beforeEach(() => {
      TestBed.configureTestingModule({
         imports: [TestComponent],
      });
      injector = TestBed.inject(Injector);
   });

   it('should track all signals from deepFormSignal and handle nullable .controls', async () => {
      const form$ = signal<FormGroup<{
         name: FormControl<string | null>;
         age: FormControl<number | null>;
      }> | null>(null);
      const dSignal = deepFormSignal(form$, { injector });
      let controls = dSignal.controls?.();
      TestBed.flushEffects();

      expect(controls).toBeNull();
      expect(dSignal.value()).toBeNull();

      const form = new FormGroup({
         name: new FormControl('', Validators.required),
         age: new FormControl(1),
      });

      form$.set(form);
      TestBed.flushEffects();
      controls = dSignal.controls?.();
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
      controls = dSignal.controls?.();
      TestBed.flushEffects();
      expect(dSignal.touched()).toBe(true);
      expect(controls!.name.touched()).toBe(true);

      // disable control
      form.controls.name.disable();
      TestBed.flushEffects();
      controls = dSignal.controls?.();
      TestBed.flushEffects();
      expect(dSignal.enabled()).toBe(true);
      expect(controls!.name.enabled()).toBe(false);

      // back to null
      form$.set(null);
      TestBed.flushEffects();
      controls = dSignal.controls?.();
      TestBed.flushEffects();

      expect(controls).toBeNull();
      expect(dSignal.value()).toBeNull();
      expect(dSignal.errors()).toBeNull();
   });

   it('should reflect dynamically added and removed FormRecord controls', () => {
      const form = new FormRecord({
         a: new FormControl('A'),
      });

      const form$ = signal(form);
      const dSignal = deepFormSignal(form$, { injector });
      TestBed.flushEffects();
      let controls = dSignal.controls();
      TestBed.flushEffects();

      // initial state
      expect(controls).toBeDefined();
      expect(controls['a']).toBeDefined();
      expect(controls['b']).toBeUndefined();

      // dynamically add control
      form.addControl('b', new FormControl('B'));
      TestBed.flushEffects();
      controls = dSignal.controls();
      TestBed.flushEffects();

      expect(controls['b']).toBeDefined();
      expect(controls['b'].value()).toBe('B');
      expect(controls['b'].dirty()).toBe(false);
      expect(controls['b'].touched()).toBe(false);
      expect(controls['b'].errors()).toBeNull();
      expect(dSignal.value()).toEqual({ a: 'A', b: 'B' });

      // update new control
      form.controls['b'].setValue('B2');
      TestBed.flushEffects();

      expect(controls['b'].value()).toBe('B2');

      // remove control
      form.removeControl('b');
      TestBed.flushEffects();
      controls = dSignal.controls();
      TestBed.flushEffects();

      expect(controls['b']).toBeUndefined();
      expect(dSignal.value()).toEqual({ a: 'A' });
   });

   it('should reflect dynamically added and removed FormGroup controls', () => {
      const form = new FormGroup<{
         a: FormControl<string | null>;
         b?: FormControl<string | null>;
      }>({
         a: new FormControl('A'),
      });

      const form$ = signal(form);
      const dSignal = deepFormSignal(form$, { injector });
      TestBed.flushEffects();
      let controls = dSignal.controls();
      TestBed.flushEffects();

      // initial state
      expect(controls).toBeDefined();
      expect(controls!.a).toBeDefined();
      expect((controls as any).b).toBeUndefined();

      // dynamically add control
      form.addControl('b', new FormControl('B'));
      TestBed.flushEffects();
      controls = dSignal.controls();
      TestBed.flushEffects();

      expect(controls!.b).toBeDefined();
      expect(controls!.b!.value()).toBe('B');
      expect(controls!.b!.dirty()).toBe(false);
      expect(controls!.b!.touched()).toBe(false);
      expect(controls!.b!.errors()).toBeNull();

      // update new control
      form.controls.b!.setValue('B2');
      TestBed.flushEffects();

      expect(controls!.b!.value()).toBe('B2');

      // remove control
      form.removeControl('b');
      TestBed.flushEffects();
      controls = dSignal.controls();
      TestBed.flushEffects();

      expect(controls.b).toBeUndefined();
      expect(dSignal.value()).toEqual({ a: 'A' });
   });

   it('should reflect dynamically added and removed FormArray controls', () => {
      const array = new FormArray<FormControl<string | null>>([
         new FormControl('A'),
      ]);

      const form$ = signal(array);
      const dSignal = deepFormSignal(form$, { injector });
      TestBed.flushEffects();
      let controls = dSignal.controls();
      TestBed.flushEffects();

      // initial state
      expect(controls).toBeDefined();
      expect(controls!.length).toBe(1);
      expect(controls![0].value()).toBe('A');

      // push new control
      array.push(new FormControl('B'));
      TestBed.flushEffects();
      controls = dSignal.controls();
      TestBed.flushEffects();

      expect(controls!.length).toBe(2);
      expect(controls![1].value()).toBe('B');
      expect(controls![1].dirty()).toBe(false);
      expect(controls![1].touched()).toBe(false);
      expect(controls![1].errors()).toBeNull();

      // update new control
      array.at(1).setValue('B2');
      TestBed.flushEffects();

      expect(controls![1].value()).toBe('B2');

      // remove control
      array.removeAt(1);
      TestBed.flushEffects();
      controls = dSignal.controls();
      TestBed.flushEffects();

      expect(controls!.length).toBe(1);
      expect(controls![0].value()).toBe('A');
      expect(dSignal.value()).toEqual(['A']);
   });

   it('should not throw when formSignal is created before ngOnInit', () => {
      expect(() => {
         fixture = TestBed.createComponent(TestComponent);
      }).not.toThrow();
   });

   it('should work once the required input is set', () => {
      fixture = TestBed.createComponent(TestComponent);

      const form = new FormGroup({
         name: new FormControl('Alice'),
      });

      // set required input
      fixture.componentRef.setInput('form', form);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const dSignal = component.dSignal;
      const controls = dSignal.controls();
      TestBed.flushEffects();

      // formSignal should now be fully functional
      expect(dSignal.value()).toEqual({ name: 'Alice' });
      expect(controls.name.value()).toEqual('Alice');

      // update form
      form.controls.name.setValue('Bob');
      TestBed.flushEffects();

      expect(dSignal.value()).toEqual({ name: 'Bob' });
      expect(controls.name.value()).toEqual('Bob');
   });
});
