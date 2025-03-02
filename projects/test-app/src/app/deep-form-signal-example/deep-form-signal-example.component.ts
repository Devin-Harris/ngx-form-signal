import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DeepFormSignalChildComponent } from './deep-form-signal-child.component';

@Component({
   selector: 'deep-form-signal-example',
   standalone: true,
   imports: [DeepFormSignalChildComponent],
   templateUrl: './deep-form-signal-example.component.html',
   styleUrl: './deep-form-signal-example.component.scss',
})
export class DeepFormSignalExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });

   readonly render = signal(true);

   private dirtySubscription: Subscription | null = null;

   private readonly cd = inject(ChangeDetectorRef);

   onRegisterDirtySubscription(dirtySubscription: Subscription | null) {
      this.dirtySubscription = dirtySubscription;
      this.cd.detectChanges();
   }

   toggle() {
      const shouldDestroy = this.render();
      const preClosed = this.dirtySubscription?.closed;
      this.render.update((r) => !r);
      this.cd.detectChanges();
      const postClosed = this.dirtySubscription?.closed;

      if (shouldDestroy) {
         console.log('preClosed: ', preClosed, 'postClosed: ', postClosed);
      }
   }
}
