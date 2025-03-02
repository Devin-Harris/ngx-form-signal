import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { formSignal } from '../../../../ngx-form-signal/src/public-api';
import { FormSignalPreviewComponent } from '../common/form-signal-preview.component';

@Component({
   selector: 'form-array-example',
   standalone: true,
   templateUrl: './form-array-example.component.html',
   styleUrl: './form-array-example.component.scss',
   imports: [CommonModule, FormSignalPreviewComponent],
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
   // Could imagine using this computed variable to drive a form validator based on all the controls in the form array
   readonly duplicateNames = computed(() => {
      const names = this.formArraySignal.value();
      const map: { [x: string]: { name: string; index: number }[] } = {};
      names?.forEach((n, index) => {
         const k = n?.name.toLowerCase();
         if (k) {
            if (!map[k]) {
               map[k] = [];
            }
            map[k].push({ name: n?.name ?? '', index });
         }
      });

      return Object.keys(map)
         .filter((k) => map[k].length > 1)
         .map((k) => ({ [k]: map[k] }));
   });

   // Update value and validity after adding/removing controls so value signals are properly updated
   add(name: string) {
      this.formArray.push(new FormControl({ name }));
      this.formArray.updateValueAndValidity();
   }
   remove(name: string) {
      const index = this.formArray.value.findIndex(
         (c) => c?.name.toLowerCase() === name.toLowerCase()
      );
      if (index >= 0) {
         this.formArray.removeAt(index);
         this.formArray.updateValueAndValidity();
      }
   }
   disable(name: string) {
      const index = this.formArray
         .getRawValue()
         .findIndex((c) => c?.name.toLowerCase() === name.toLowerCase());
      if (index >= 0) {
         this.formArray.at(index).disable();
      }
   }
   enable(name: string) {
      const index = this.formArray
         .getRawValue()
         .findIndex((c) => c?.name.toLowerCase() === name.toLowerCase());
      if (index >= 0) {
         this.formArray.at(index).enable();
      }
   }
   touch(name: string) {
      const index = this.formArray
         .getRawValue()
         .findIndex((c) => c?.name.toLowerCase() === name.toLowerCase());
      if (index >= 0) {
         this.formArray.at(index).markAsTouched();
      }
   }
   untouch(name: string) {
      const index = this.formArray
         .getRawValue()
         .findIndex((c) => c?.name.toLowerCase() === name.toLowerCase());
      if (index >= 0) {
         this.formArray.at(index).markAsUntouched();
      }
   }
}
