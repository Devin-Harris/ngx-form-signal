import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormSignalSnapshotComponent } from './form-signal-snapshot.component';

@Component({
  selector: 'form-signal-preview-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
      @let f = form(); 
      @if (f) { 
         <div class="actions">
            <button (click)="f.disabled ? f.enable() : f.disable()">
               {{ f.disabled ? 'Enable' : 'Disable' }}
            </button>
            <button (click)="f.dirty ? f.markAsPristine() : f.markAsDirty()">
               {{ f.dirty ? 'Mark as pristine' : 'Mark as dirty' }}
            </button>
            <button (click)="f.touched ? f.markAsUntouched() : f.markAsTouched()">
               {{ f.touched ? 'Mark as untouched' : 'Mark as touched' }}
            </button>
            <button (click)="setError()">
               {{ f.errors ? 'Clear errors' : 'Set errors' }}
            </button>
         </div>
      }
   `,
  styles: `
   :host {
      width: 100%;
      .actions {
         margin-top: .5em;
         display: flex;
         gap: .25em;
         button {
            padding: .25em;
         }
      }
   }
   `,
})
export class FormSignalPreviewActionsComponent {
  readonly form = input<FormControl | FormGroup | FormArray | null>(null);

  readonly showPreview = signal(true);

  setError() {
    const form = this.form();
    if (form) {
      form.setErrors(form.errors ? null : { someError: true });
    }
  }
}
