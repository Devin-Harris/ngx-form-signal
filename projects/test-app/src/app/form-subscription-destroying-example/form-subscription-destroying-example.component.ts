import { Component, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormSubscriptionDestroyingChildComponent } from './form-subscription-destroying-child.component';

@Component({
   selector: 'form-subscription-destroying-example',
   standalone: true,
   imports: [FormSubscriptionDestroyingChildComponent],
   templateUrl: './form-subscription-destroying-example.component.html',
   styleUrl: './form-subscription-destroying-example.component.scss',
})
export class FormSubscriptionDestroyingExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });

   readonly render = signal(true);

   childDirtySignal: Signal<boolean> | null = null;

   onRegisterDirtyInfo(event: {
      subscription: Subscription | null;
      dirtySignal: Signal<boolean>;
   }) {
      this.childDirtySignal = event.dirtySignal;
      if (event.subscription) {
         event.subscription.add(() => {
            console.log('dirty subscription closing');
         });
      }
   }

   toggle() {
      this.render.update((r) => !r);
   }
}
