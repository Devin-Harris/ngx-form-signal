import { CommonModule } from '@angular/common';
import { Component, effect, input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { formSignal } from '../../../../ngx-form-signal/src/lib/form-signal';

@Component({
   selector: 'form-signal-snapshot',
   standalone: true,
   imports: [CommonModule],
   template: `
      @let formSnapshot = formSignal();
      <div class="form-info-container">
         <div class="form-info">
            <strong>Value:</strong>
            <pre>{{ formSnapshot.value | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Raw Value:</strong>
            <pre>{{ formSnapshot.rawValue | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Status:</strong>
            <pre>{{ formSnapshot.status | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Touched:</strong>
            <pre>{{ formSnapshot.touched | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Untouched:</strong>
            <pre>{{ formSnapshot.untouched | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Dirty:</strong>
            <pre>{{ formSnapshot.dirty | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Pristine:</strong>
            <pre>{{ formSnapshot.pristine | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Disabled:</strong>
            <pre>{{ formSnapshot.disabled | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Enabled:</strong>
            <pre>{{ formSnapshot.enabled | json }}</pre>
         </div>

         <div class="form-info">
            <strong>Pending:</strong>
            <pre>{{ formSnapshot.pending | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Valid:</strong>
            <pre>{{ formSnapshot.valid | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Invalid:</strong>
            <pre>{{ formSnapshot.invalid | json }}</pre>
         </div>
         <div class="form-info">
            <strong>Errors:</strong>
            <pre>{{ formSnapshot.errors | json }}</pre>
         </div>
      </div>
   `,
   styles: `
   .form-info-container {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
      grid-gap: 1px;
   
      .form-info {
         outline: 1px solid gray;
         padding: .5em;
         pre {
            margin: 0;
            font-size: .85em;     
            width: max-content;
         }
      }
   }
   `,
})
export class FormSignalSnapshotComponent {
   readonly form = input<FormControl | FormGroup | FormArray | null>(null);
   readonly formSignal = formSignal(this.form);

   readonly formChange = effect(() => {
      console.log(this.formSignal());
   });
}
