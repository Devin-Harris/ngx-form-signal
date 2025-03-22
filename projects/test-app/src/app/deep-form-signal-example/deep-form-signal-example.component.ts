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

   changeHistory: { type: string; value: any; timestamp: Date }[] = [];

   readonly anyChangeEffect = effect(() => {
      console.log(this.deepFormSignal());
   });

   readonly addressEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address',
         value: this.deepFormSignal.children.address.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly addressStateEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address.state',
         value: this.deepFormSignal.children.address.children.state.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly addressStreetEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address.street',
         value: this.deepFormSignal.children.address.children.street.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly addressZipEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address.zip',
         value: this.deepFormSignal.children.address.children.zip.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly emailEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'email',
         value: this.deepFormSignal.children.email.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly messageEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'message',
         value: this.deepFormSignal.children.message.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly nameEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'name',
         value: this.deepFormSignal.children.name.value(),
         timestamp: new Date(Date.now()),
      });
   });
}
