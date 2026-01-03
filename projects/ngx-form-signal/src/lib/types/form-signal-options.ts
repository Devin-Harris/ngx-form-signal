import { Injector } from '@angular/core';

export type FormSignalOptions = {
   injector?: Injector;
   /**
    * When true, signals notify eagerly on every control event,
    * bypassing equality checks and memoization.
    */
   eagerNotify?: boolean;
};

export function buildDefaultFormSignalOptions(): FormSignalOptions {
   return {};
}
