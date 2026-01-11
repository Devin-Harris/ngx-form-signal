import { Routes } from '@angular/router';

export const routes: Routes = [
   {
      path: '',
      pathMatch: 'full',
      loadComponent: () =>
         import('./default-example/default-example.component').then(
            ({ DefaultExampleComponent }) => DefaultExampleComponent
         ),
   },
   {
      path: 'deep-form-signal',
      loadComponent: () =>
         import('./deep-form-signal-example/deep-form-signal-example.component').then(
            ({ DeepFormSignalExampleComponent }) => DeepFormSignalExampleComponent
         ),
   },
   {
      path: 'form-array',
      loadComponent: () =>
         import('./form-array-example/form-array-example.component').then(
            ({ FormArrayExampleComponent }) => FormArrayExampleComponent
         ),
   },
];
