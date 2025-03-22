import { Component, computed, effect } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { formSignal } from '../../../../ngx-form-signal/src/lib/form-signal';
import { EmailControlComponent } from './controls/email.component';
import { FormInfoComponent } from './controls/form.component';
import { MessageControlComponent } from './controls/message.component';
import { NameControlComponent } from './controls/name.component';
import { DefaultTableComponent } from './table/default-table.component';

@Component({
   selector: 'default-example',
   standalone: true,
   imports: [
      FormInfoComponent,
      NameControlComponent,
      MessageControlComponent,
      EmailControlComponent,
      DefaultTableComponent,
   ],
   templateUrl: './default-example.component.html',
   styleUrl: './default-example.component.scss',
})
export class DefaultExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });

   readonly formSignal = formSignal(this.form);
   readonly nameSignal = formSignal(this.form.controls.name);
   readonly emailSignal = formSignal(this.form.controls.email);
   readonly messageSignal = formSignal(this.form.controls.message);
   readonly signals = [
      { signal: this.formSignal, key: 'form' },
      { signal: this.nameSignal, key: 'name' },
      { signal: this.emailSignal, key: 'email' },
      { signal: this.messageSignal, key: 'message' },
   ];

   readonly derivedValue = computed(() => {
      const value = this.formSignal.value();
      const valueStr = value
         ? `Name: ${value.name}; Email: ${value.email}; Message: ${value.message}`
         : '';
      const statusStr = `Status: ${this.formSignal.status()}`;
      const touchedStr = `Touched: ${this.formSignal.touched()}`;
      const dirty = `Dirty: ${this.formSignal.dirty()}`;

      return `${valueStr}; ${statusStr}; ${touchedStr}; ${dirty}`;
   });

   readonly derivedChange = effect(() => {
      console.log(this.derivedValue());
   });
}
