import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { formSignal } from '../../../../../ngx-form-signal/src/public-api';

@Component({
   selector: 'default-table',
   standalone: true,
   imports: [CommonModule],
   templateUrl: './default-table.component.html',
   styleUrl: './default-table.component.scss',
})
export class DefaultTableComponent {
   readonly form = input<FormGroup<{
      name: FormControl<string | null>;
      email: FormControl<string | null>;
      message: FormControl<string | null>;
   }> | null>(null);

   readonly formSignal = formSignal(this.form);
   readonly name = computed(() => this.form()?.controls.name ?? null);
   readonly nameSignal = formSignal(this.name);
   readonly email = computed(() => this.form()?.controls.email ?? null);
   readonly emailSignal = formSignal(this.email);
   readonly message = computed(() => this.form()?.controls.message ?? null);
   readonly messageSignal = formSignal(this.message);
   readonly signals = [
      { signal: this.formSignal, key: 'Overall Form' },
      { signal: this.nameSignal, key: 'Name control' },
      { signal: this.emailSignal, key: 'Email control' },
      { signal: this.messageSignal, key: 'Message control' },
   ];
}
