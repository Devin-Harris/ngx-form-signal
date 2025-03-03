import { Component, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormSignalPreviewComponent } from '../../common/form-signal-preview.component';
import { FormSignalPreviewActionsComponent } from '../../common/form-signal-preview-actions.component';

@Component({
  selector: 'form-info',
  standalone: true,
  imports: [FormSignalPreviewActionsComponent],
  template: `
      @let f = form(); 
      @if (f) {
      <div class="form-control">
         <label>Overall Form Info</label>
         <form-signal-preview-actions [form]="f"></form-signal-preview-actions>
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
