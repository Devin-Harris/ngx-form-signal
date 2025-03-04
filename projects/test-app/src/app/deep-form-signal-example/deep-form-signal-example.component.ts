import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { deepFormSignal } from '../../../../ngx-form-signal/src/public-api';

@Component({
   selector: 'deep-form-signal-example',
   standalone: true,
   templateUrl: './deep-form-signal-example.component.html',
   styleUrl: './deep-form-signal-example.component.scss',
   imports: [CommonModule],
})
export class DeepFormSignalExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
      address: new FormGroup({
         street: new FormControl(''),
         state: new FormControl(''),
         zip: new FormControl(''),
      }),
   });

   readonly formSignal = deepFormSignal(this.form);

   readonly preview = computed(() => {
      return { ...this.formSignal(), subscriptions: null };
   });
   // readonly preview2 = effect(() => {
   //    const c = this.formSignal.children
   //    if (c) {
   //       console.log(c)
   //    }

   // });

   constructor() {
      const c = this.formSignal.children;
      if (c) {
         console.log(c);
      }
   }
}
