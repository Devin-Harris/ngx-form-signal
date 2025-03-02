import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { formSignal } from '../../../../../ngx-form-signal/src/public-api';
import { FormSignalPreviewComponent } from '../form-signal-preview/form-signal-preview.component';

@Component({
   selector: 'name-control',
   standalone: true,
   imports: [ReactiveFormsModule, FormSignalPreviewComponent],
   template: `
      @let c = control(); 
      @if (c) {
         <div class="form-control">
            <label for="name">Name</label>
            <input type="text" [formControl]="c" name="name" />
            <form-signal-preview [form]="c"></form-signal-preview>
         </div>
      }
   `,
   styleUrl: './controls.component.scss',
   host: {
      '[class.invalid]': 'controlSignal.invalid()',
   },
})
export class NameControlComponent {
   readonly control = input<FormControl<string | null> | null>(null);
   readonly controlSignal = formSignal(this.control);
}
