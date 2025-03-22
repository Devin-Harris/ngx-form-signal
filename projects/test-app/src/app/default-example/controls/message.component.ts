import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { formSignal } from '../../../../../ngx-form-signal/src/public-api';
import { FormSignalPreviewComponent } from '../../common/form-signal-preview.component';
import { FormSignalPreviewActionsComponent } from '../../common/form-signal-preview-actions.component';

@Component({
  selector: 'message-control',
  standalone: true,
  imports: [ReactiveFormsModule, FormSignalPreviewActionsComponent],
  template: `
      @let c = control(); 
      @if (c) {
      <div class="form-control">
         <label for="message">Message</label>
         <textarea [formControl]="c" name="message" rows="1"></textarea>
         <form-signal-preview-actions [form]="c"></form-signal-preview-actions>
      </div>
      }
   `,
  styleUrl: './controls.component.scss',
  host: {
    '[class.invalid]': 'controlSignal.invalid()',
  },
})
export class MessageControlComponent {
  readonly control = input<FormControl<string | null> | null>(null);
  readonly controlSignal = formSignal(this.control);
}
