import { EnvironmentInjector, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { handleStreamSignal } from './handle-stream-signal';

describe('handleStreamSignal', () => {
   let injector: Injector;
   let envInjector: EnvironmentInjector;

   beforeEach(() => {
      injector = TestBed.inject(Injector);
      envInjector = TestBed.inject(EnvironmentInjector);
   });

   it('should call callback immediately with the current form', () => {
      const control = new FormControl('a');
      const stream$ = new Subject<string>();

      const formStream = signal({
         form: control,
         stream: stream$,
      });

      const calls: Array<[string | null, string | undefined]> = [];

      handleStreamSignal(
         formStream,
         (form, value) => calls.push([form?.value ?? null, value]),
         { injector }
      );

      TestBed.flushEffects();

      expect(calls).toEqual([['a', undefined]]);
   });

   it('should call callback when the stream emits', () => {
      const control = new FormControl('a');
      const stream$ = new Subject<string>();

      const formStream = signal({
         form: control,
         stream: stream$,
      });

      const values: string[] = [];

      handleStreamSignal(
         formStream,
         (_form, value) => {
            if (value !== undefined) values.push(value);
         },
         { injector }
      );

      TestBed.flushEffects();

      stream$.next('b');
      stream$.next('c');

      expect(values).toEqual(['b', 'c']);
   });

   it('should unsubscribe from the previous stream when formStream changes', () => {
      const control = new FormControl('a');
      const stream1$ = new Subject<string>();
      const stream2$ = new Subject<string>();

      const formStream = signal({
         form: control,
         stream: stream1$,
      });

      const values: string[] = [];

      handleStreamSignal(
         formStream,
         (_form, value) => {
            if (value) values.push(value);
         },
         { injector }
      );

      TestBed.flushEffects();

      stream1$.next('one');

      formStream.set({
         form: control,
         stream: stream2$,
      });

      TestBed.flushEffects();

      stream1$.next('SHOULD_NOT_EMIT');
      stream2$.next('two');

      expect(values).toEqual(['one', 'two']);
   });

   it('should clean up subscriptions when injector is destroyed', () => {
      const control = new FormControl('a');
      const stream$ = new Subject<string>();

      const formStream = signal({
         form: control,
         stream: stream$,
      });

      const values: string[] = [];

      const effectRef = handleStreamSignal(
         formStream,
         (_form, value) => {
            if (value) values.push(value);
         },
         { injector: envInjector }
      );

      TestBed.flushEffects();

      stream$.next('before');
      effectRef.destroy();
      stream$.next('after');

      expect(values).toEqual(['before']);
   });
});
