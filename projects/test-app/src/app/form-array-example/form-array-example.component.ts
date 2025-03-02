import { Component } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { formSignal } from '../../../../ngx-form-signal/src/public-api';
import { FormSignalPreviewComponent } from '../common/form-signal-preview.component';

@Component({
   selector: 'form-array-example',
   standalone: true,
   templateUrl: './form-array-example.component.html',
   styleUrl: './form-array-example.component.scss',
   imports: [FormSignalPreviewComponent],
})
export class FormArrayExampleComponent {
   readonly formArray = new FormArray([
      new FormControl({ name: 'Joe' }),
      new FormControl({ name: 'Bill' }),
      new FormControl({ name: 'Bob' }),
      new FormControl({ name: 'Dave' }),
      new FormControl({ name: 'Kyle' }),
   ]);

   readonly formArraySignal = formSignal(this.formArray);

   setError() {
      if (this.formArray.errors) {
         this.formArray.setErrors(null);
      } else {
         this.formArray.setErrors({ someError: true });
      }
   }
}
