import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FormSignalSnapshotComponent } from './form-signal-snapshot.component';
import { FormSignalPreviewActionsComponent } from './form-signal-preview-actions.component';

@Component({
  selector: 'form-signal-preview',
  standalone: true,
  imports: [
    CommonModule,
    FormSignalPreviewActionsComponent,
    FormSignalSnapshotComponent,
  ],
  template: `
      @let f = form(); 
      @if (f) { 
         @let show = showPreview(); 
         @if(show) {
            <form-signal-snapshot [form]="f"></form-signal-snapshot>
         }

         <form-signal-preview-actions [form]="f"></form-signal-preview-actions>
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

  readonly showPreview = input(true);
}
