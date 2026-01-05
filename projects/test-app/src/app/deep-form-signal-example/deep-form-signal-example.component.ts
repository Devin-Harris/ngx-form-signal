import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
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
   readonly form = new FormGroup<{
      name: FormControl<string | null>;
      email: FormControl<string | null>;
      message: FormControl<string | null>;
      address: FormGroup<{
         street: FormControl<any>;
         state: FormControl<any>;
         zip: FormControl<any>;
      }>;
      asdf?: FormControl<string | null>;
   }>({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
      address: new FormGroup<{
         street: FormControl<any>;
         state: FormControl<any>;
         zip: FormControl<any>;
      }>({
         street: new FormControl(''),
         state: new FormControl(''),
         zip: new FormControl(''),
      }),
   });

   readonly form$ = signal<typeof this.form | null>(this.form);

   readonly formSignal = formSignal(this.form$);
   readonly deepFormSignal = deepFormSignal(this.form$);

   t = effect(() => {
      console.log('here', this.deepFormSignal.controls?.());
   });

   ngOnInit() {
      setTimeout(() => {
         console.log('here 1');
         this.form.controls.name.setValue('asdf');
         setTimeout(() => {
            console.log('here 2');
            this.form.addControl('asdf', new FormControl('asdfasdf'));
         }, 5000);
      }, 5000);
   }

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
         value: this.deepFormSignal.controls?.address.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly addressStateEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address.state',
         //@ts-ignore
         value: this.deepFormSignal.controls?.address.controls.state.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly addressStreetEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address.street',
         value: this.deepFormSignal.controls?.address.controls.street.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly addressZipEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'address.zip',
         value: this.deepFormSignal.controls?.address.controls.zip.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly emailEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'email',
         value: this.deepFormSignal.controls?.email.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly messageEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'message',
         value: this.deepFormSignal.controls?.message.value(),
         timestamp: new Date(Date.now()),
      });
   });
   readonly nameEffect = effect(() => {
      this.changeHistory.unshift({
         type: 'name',
         value: this.deepFormSignal.controls?.name.value(),
         timestamp: new Date(Date.now()),
      });
   });
}
