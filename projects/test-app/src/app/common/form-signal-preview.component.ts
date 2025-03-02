import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormSignalSnapshotComponent } from './form-signal-snapshot.component';

@Component({
   selector: 'form-signal-preview',
   standalone: true,
   imports: [CommonModule, FormSignalSnapshotComponent],
   template: `
      @let f = form(); 
      @if (f) { 
         @let show = showPreview(); 
         @if(show) {
            <form-signal-snapshot [form]="f"></form-signal-snapshot>
         }

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
            <button (click)="toggle()">{{ show ? 'Hide' : 'Show' }} Info</button>
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
export class FormSignalPreviewComponent {
   readonly form = input<FormControl | FormGroup | FormArray | null>(null);

   readonly showPreview = signal(true);

   toggle() {
      this.showPreview.update((s) => !s);
   }

   setError() {
      const form = this.form();
      if (form) {
         if (form.errors) {
            form.setErrors(null);
         } else {
            form.setErrors({ someError: true });
         }
      }
   }
}
