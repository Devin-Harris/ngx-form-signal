import { Component, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormSignalPreviewComponent } from '../form-signal-preview/form-signal-preview.component';

@Component({
   selector: 'form-info',
   standalone: true,
   imports: [FormSignalPreviewComponent],
   template: `
      @let f = form(); @if (f) {
      <div class="form-control">
         <label>Overall Form Info</label>
         <form-signal-preview [form]="f"></form-signal-preview>
      </div>
      }
   `,
   styleUrl: './controls.component.scss',
})
export class FormInfoComponent {
   readonly form = input<FormGroup<{
      name: FormControl<string | null>;
      email: FormControl<string | null>;
      message: FormControl<string | null>;
   }> | null>(null);
}
