import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { formSignal } from '../../../../ngx-form-signal/src/lib/form-signal';

@Component({
   selector: 'deep-form-signal-child',
   standalone: true,
   imports: [],
   template: `
      <p>Child</p>
      <span>Dirty: {{ formSignal.dirty() }}</span>
   `,
})
export class DeepFormSignalChildComponent {
   readonly form = input<FormGroup<{
      name: FormControl<string | null>;
      email: FormControl<string | null>;
      message: FormControl<string | null>;
   }> | null>(null);

   readonly formSignal = formSignal(this.form);

   readonly registerDirtySubscription = output<Subscription | null>();

   readonly dirtySubscriptionChange = effect(() => {
      this.registerDirtySubscription.emit(
         this.formSignal.subscriptions.dirtyChangeSubscription()
      );
   });
}
