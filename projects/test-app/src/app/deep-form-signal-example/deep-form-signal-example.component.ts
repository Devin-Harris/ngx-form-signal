import { CommonModule } from '@angular/common';
import { Component, computed, effect } from '@angular/core';
import {
   FormControl,
   FormGroup,
   ReactiveFormsModule,
   Validators,
} from '@angular/forms';
import {
   deepFormSignal,
   formSignal,
} from '../../../../ngx-form-signal/src/public-api';

@Component({
   selector: 'deep-form-signal-example',
   standalone: true,
   templateUrl: './deep-form-signal-example.component.html',
   styleUrl: './deep-form-signal-example.component.scss',
   imports: [CommonModule, ReactiveFormsModule],
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

   readonly formSignal = formSignal(this.form);
   readonly deepFormSignal = deepFormSignal(this.form);

   readonly preview = computed(() => {
      return { ...this.formSignal(), subscriptions: null };
   });

   readonly addressEffect = effect(() => {
      console.log('address:', this.deepFormSignal.children.address.value());
   });
   readonly addressStateEffect = effect(() => {
      console.log(
         'address state:',
         this.deepFormSignal.children.address.children.state.value()
      );
   });
   readonly addressStreetEffect = effect(() => {
      console.log(
         'address street:',
         this.deepFormSignal.children.address.children.street.value()
      );
   });
   readonly addressZipEffect = effect(() => {
      console.log(
         'address zip:',
         this.deepFormSignal.children.address.children.zip.value()
      );
   });
   readonly emailEffect = effect(() => {
      console.log('email:', this.deepFormSignal.children.email.value());
   });
   readonly messageEffect = effect(() => {
      console.log('message:', this.deepFormSignal.children.message.value());
   });
   readonly nameEffect = effect(() => {
      console.log('name:', this.deepFormSignal.children.name.value());
   });
}
