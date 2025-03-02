import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { formSignal } from '../../../../ngx-form-signal/src/lib/form-signal';

@Component({
   selector: 'deep-form-signal-example',
   standalone: true,
   imports: [],
   templateUrl: './deep-form-signal-example.component.html',
   styleUrl: './deep-form-signal-example.component.scss',
})
export class DeepFormSignalExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });

   readonly formSignal = formSignal(this.form);

   readonly render = signal(true);
}
