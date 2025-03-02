import { Component } from '@angular/core';

@Component({
   selector: 'deep-form-signal-example',
   standalone: true,
   templateUrl: './deep-form-signal-example.component.html',
   styleUrl: './deep-form-signal-example.component.scss',
})
export class DeepFormSignalExampleComponent {
   // readonly form = new FormGroup({
   //    name: new FormControl('Joe Smith', { validators: Validators.required }),
   //    email: new FormControl('js@someemail.com', {
   //       validators: [Validators.required, Validators.email],
   //    }),
   //    message: new FormControl('Hello world!'),
   // });
}
