import { Routes } from '@angular/router';

export const routes: Routes = [
   {
      path: '',
      loadComponent: () =>
         import('./default-example/default-example.component').then(
            ({ DefaultExampleComponent }) => DefaultExampleComponent
         ),
   },
   {
      path: 'deep-form-signal',
      loadComponent: () =>
         import(
            './deep-form-signal-example/deep-form-signal-example.component'
         ).then(
            ({ DeepFormSignalExampleComponent }) =>
               DeepFormSignalExampleComponent
         ),
   },
   {
      path: 'form-subscription-destroying',
      loadComponent: () =>
         import(
            './form-subscription-destroying-example/form-subscription-destroying-example.component'
         ).then(
            ({ FormSubscriptionDestroyingExampleComponent }) =>
               FormSubscriptionDestroyingExampleComponent
         ),
   },
];
