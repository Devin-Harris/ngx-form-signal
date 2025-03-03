import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { formSignal } from '../../../../../ngx-form-signal/src/public-api';
import { FormSignalPreviewComponent } from '../../common/form-signal-preview.component';
import { FormSignalPreviewActionsComponent } from '../../common/form-signal-preview-actions.component';

@Component({
  selector: 'email-control',
  standalone: true,
  imports: [ReactiveFormsModule, FormSignalPreviewActionsComponent],
  template: `
      @let c = control(); 
      @if (c) {
      <div class="form-control">
         <label for="email">Email</label>
         <input type="email" [formControl]="c" name="email" />
         <form-signal-preview-actions [form]="c"></form-signal-preview-actions>
      </div>
      }
   `,
  styleUrl: './controls.component.scss',
  host: {
    '[class.invalid]': 'controlSignal.invalid()',
  },
})
export class EmailControlComponent {
  readonly control = input<FormControl<string | null> | null>(null);
  readonly controlSignal = formSignal(this.control);
}
