import { Component, effect, input, output, Signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { formSignal } from '../../../../ngx-form-signal/src/lib/form-signal';

@Component({
   selector: 'form-subscription-destroying-child',
   standalone: true,
   imports: [],
   template: `
      <p>Child</p>
      <span>Dirty: {{ formSignal.dirty() }}</span>
   `,
   styles: `
      :host {    
         display: block;
         border: 1px solid gray;
         padding: .5em;
         width: max-content;
      }
   `,
})
export class FormSubscriptionDestroyingChildComponent {
   readonly form = input<FormGroup<{
      name: FormControl<string | null>;
      email: FormControl<string | null>;
      message: FormControl<string | null>;
   }> | null>(null);

   readonly formSignal = formSignal(this.form);

   readonly registerDirtyInfo = output<{
      subscription: Subscription | null;
      dirtySignal: Signal<boolean>;
   }>();

   readonly dirtySubscriptionChange = effect(() => {
      this.registerDirtyInfo.emit({
         subscription: this.formSignal.subscriptions.dirtyChangeSubscription(),
         dirtySignal: this.formSignal.dirty,
      });
   });
}
