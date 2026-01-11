# ngx-form-signal

Reactive Forms -> Signals api for angular.

The goal of NgxFormSignal is to allow easy conversion from existing reactive form objects to reactive signal primitives. This gives developers the ability to derive state off an existing form object as well as react to form state changes such as dirty, invalid, touched, etc... while remaining in the signal realm.

Note this is NOT related to the built in [signal forms](https://angular.dev/guide/forms/signals/overview) api, but their may be interop at a future time.

---

## Table of Contents

-  [Installation](#installation)
-  [Basic Concepts](#basics)
-  [Usage](#usage)
   -  [Simple Example](#simple)
   -  [Deep Form Signal Example](#deepFormSignal)
-  [Issues](#issues)

<a name="installation"/>

## Installation

Install with **NPM**

```bash
npm i ngx-form-signal
```

<a name="basics"/>

## Basic Concepts

The main helper function in this library is the `formSignal` function. Simply passing a reactive form object or a signal wrapping a reactive form object to this function will perform all the necessary subscriptions, effects, and signal creations for all the form fields you typically want to track changes to.

The `formSignal` method also allows additional options to be passed in such as:

-  `injector`
   -  since it internally uses effects you must be in an injection context when using the method
-  `eagerNotify`
   -  flag so you can define the internal signals with an always false equality comparison
   -  useful for when you want to react to a form value change, even if it was set to the same value it was previously
   -  this is closer behavior to how the valueChanges event stream behaves
   -  is turned off by default

There is also a `deepFormSignal` which works similarly to the `formSignal`, with the main caveat being it recursively builds form signals for all nested FormGroups and FormArrays. This way you can essentially create a formSignal for every control in the overall form with a single function call, and access them from a single variable. The nested formSignals are placed inside a `controls` field similar to how reactive forms api works.

The `formSignal` and `deepFormSignal` also cleanup all the subscriptions made internally when the injection context is destroyed, so generally no need to worry about unsubscribing/cleaning up things while utilize this library to react to form changes.

## Usage

<a name="simple"/>

### Simple example

The first simple example can show how the `formSignal` function can be used.

Imagine you first have some form object:

```typescript
@Component({...})
export class SimpleExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });
}
```

Now imagine you want to react to changes to this form for some purpose. For this example maybe I want to show a warning message when the name control is set to some name that is already in some other list of names.

Normally, to do this you may have some `showDuplicateNameWarning` boolean that you set when the forms name control value changes.

```typescript
@Component({...})
export class SimpleExampleComponent {
   readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });

   someListOfExistingNames: string[] = [...];
   showDuplicateNameWarning: boolean = false;

   constructor() {
      this.form.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe(name => {
         this.showDuplicateNameWarning = this.someListOfExistingNames.some(n => n.toLowerCase() === name.toLowerCase())
      })
   }
}
```

This deriving of local component state is a perfect use case for a computed signal. If we simply had a `value` signal that reacted to the forms value changes, that we then used to derive the `showDuplicateNameWarning` field, we could

-  no longer have to maintain a subscription to the form
-  refactor the component into more declarative blocks
-  utilize fine grained reactivity (instead of relying on heavy change detection mechanisms like zonejs)
-  we can make `showDuplicateNameWarning` field immutable so its not accidently written to in inconsistent ways elsewhere in the components logic

Still not convinced that is better? What about if the sources we derive `showDuplicateNameWarning` from are received over inputs?

```typescript
@Component({...})
export class SimpleExampleComponent {
   @Input() readonly form = new FormGroup({
      name: new FormControl('Joe Smith', { validators: Validators.required }),
      email: new FormControl('js@someemail.com', {
         validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('Hello world!'),
   });
   // form = input<FormGroup>(...);

   @Input() someListOfExistingNames: string[] = [...];
   // someListOfExistingNames = input<string[]>([...]);

   showDuplicateNameWarning: boolean = false;
   formValueChangesSubscription: Subscription | null = null;

   ngOnChanges(changes) {
      if (changes.form) {
         this.showDuplicateNameWarning = this.someListOfExistingNames.some(n => n.toLowerCase() === name.toLowerCase())

         this.formValueChangesSubscription?.unsubscribe()
         this.formValueChangesSubscription = this.form.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe(name => {
            this.showDuplicateNameWarning = this.someListOfExistingNames.some(n => n.toLowerCase() === name.toLowerCase())
         })
      }

      if (changes.someListOfExistingNames) {
         this.showDuplicateNameWarning = this.someListOfExistingNames.some(n => n.toLowerCase() === name.toLowerCase())
      }
   }
}
```

In this case you need to track the valueChanges subscription reference, then unsubscribe and resubscribe every time the form object changes (most likely by tying into the ngOnChanges lifecycle method). We also have to rerun the `showDuplicateNameWarning` derivation logic manually when either input changes. This is true for both the `@Input` decorator and the `input` function, caveat being the input function would use `effect` instead of the ngOnChanges lifecycle.

Using `formSignal` can alleviate some of these issues:

```typescript
@Component({...})
export class SimpleExampleComponent {
   /**
    * Notice how the form and someListOfExistingNames are now input signals,
    * This will illustrate how if these are defined outside our component
    * we can easily react to changes of them in our showDuplicateNameWarning derivation
    */
   readonly form = input(
      new FormGroup({
         name: new FormControl('Joe Smith', { validators: Validators.required }),
         email: new FormControl('js@someemail.com', {
            validators: [Validators.required, Validators.email],
         }),
         message: new FormControl('Hello world!'),
      })
   );
   readonly someListOfExistingNames = input<string[]>([...]);

   /**
    * Passing the signal with the form object as its value to the `formSignal` method
    * gives us a FormSignal typed variable
    */
   readonly formSignal = formSignal(this.form)

   readonly showDuplicateNameWarning = computed(() => {
      // Notice how formSignal has a `value` signal inside it that will be set internally when the form changes or its valueChanges
      const name = this.formSignal.value().name
      return this.someListOfExistingNames().some(n => n.toLowerCase() === name.toLowerCase())
   });
}
```

As you can see with this approach we are driving our state computations solely off the signal primitives and we are reacting to potential changes to the form object, the forms value, and even other inputs coming into our components. This also removes the need for a lot of cleanup steps such as unsubscribing from form subscriptions or tying into lifecycle methods such as ngOnChanges.

In the above example we are also technically subscribing to the whole forms valuechanges which is slightly different from the example before (where the form.controls.name.valueChanges was subscribed to). You can simple update this by passing the name control to the `formSignal` helper method instead if you want.

```typescript
@Component({...})
export class SimpleExampleComponent {
   readonly form = input(
      new FormGroup({
         name: new FormControl('Joe Smith', { validators: Validators.required }),
         email: new FormControl('js@someemail.com', {
            validators: [Validators.required, Validators.email],
         }),
         message: new FormControl('Hello world!'),
      })
   );
   // Pulling name control off in computed from main form
   readonly nameControl = computed(() => this.form().controls.name)
   readonly someListOfExistingNames = input<string[]>([...]);

   // Building form signal for just the name control
   readonly nameControlSignal = formSignal(this.nameControl)

   readonly showDuplicateNameWarning = computed(() => {
      // Just using name controls value
      const name = this.nameControlSignal.value()
      return this.someListOfExistingNames().some(n => n.toLowerCase() === name.toLowerCase())
   });
}
```

Note you also can pass a normal form object instead of a signal wrapped form object if you have a statically defined form

Of course the components formSignal object has many other signal fields you can utilize as well.

```typescript
@Component({...})
export class SimpleExampleComponent {
   readonly form = input(
      new FormGroup({
         ...
      })
   );

   readonly formSignal = formSignal(this.form)

   /**
    * Shows the different fields on the form that get turned into signals and stay syncing with the existing form events
    */
   readonly formSignalEffect = effect(() => {
      console.log(this.formSignal.value()) // Type safe based on the type of the form passed into the `formSignal` helper method
      console.log(this.formSignal.rawValue()) // Type safe based on the type of the form passed into the `formSignal` helper method
      console.log(this.formSignal.touched())
      console.log(this.formSignal.untouched())
      console.log(this.formSignal.dirty())
      console.log(this.formSignal.pristine())
      console.log(this.formSignal.valid())
      console.log(this.formSignal.invalid())
      console.log(this.formSignal.pending())
      console.log(this.formSignal.disabled())
      console.log(this.formSignal.enabled())
      console.log(this.formSignal.errors())
   })

   /**
    * The form signal object itself is a signal, that returns a snapshot of all the internal signals listed above
    * Useful for when you want to run some logic whenever anything on the form changes
    */
   readonly formSignalEffect = effect(() => {
      console.log(this.formSignal())
   })
}
```

<a name="deepFormSignal"/>

### Deep Form Signal example

This library also supports recursively creating form signals for a more nested form using the `deepFormSignal` method. This method, like `formSignal`, takes in a form or signal wrapped form and build a `formSignal` for each FormControl, FormGroup, and FormArray in the form. FormGroups and FormArrays then get an additional `controls` property added to them which have the nested formsignals of their children controls. This is useful for when you have a form object with many levels and want to create form signals for many/all of those levels with a single function call.

Heres a quick example on how this looks:

```typescript
@Component({...})
export class DeepFormSignalExampleComponent {
   readonly form = input(
      new FormGroup({
         name: new FormControl('Joe Smith', { validators: Validators.required }),
         email: new FormControl('js@someemail.com', {
            validators: [Validators.required, Validators.email],
         }),
         message: new FormControl('Hello world!'),
         address: new FormGroup({
            street: new FormControl(''),
            state: new FormControl(''),
            zip: new FormControl(''),
         }),
      })
   );

   /**
    * Notice how we are using deepFormSignal instead of formSignal
    * This will create a form signal for the name, email, message, address, street, state, and zip controls/groups
    * defined above and add the street, state, zip formsignals to the address DeepFormSignals controls array
    */
   readonly deepFormSignal = deepFormSignal(this.form)

   readonly addressEffect = effect(() => {
      console.log(this.deepFormSignal.controls.address.value())
   });
   readonly addressStateEffect = effect(() => {
      console.log(this.deepFormSignal.controls.address.controls.state.value())
   });
   readonly addressStreetEffect = effect(() => {
      console.log(this.deepFormSignal.controls.address.controls.street.value())
   });
   readonly addressZipEffect = effect(() => {
      console.log(this.deepFormSignal.controls.address.controls.zip.value())
   });
   readonly emailEffect = effect(() => {
      console.log(this.deepFormSignal.controls.email.value())
   });
   readonly messageEffect = effect(() => {
      console.log(this.deepFormSignal.controls.message.value())
   });
   readonly nameEffect = effect(() => {
      console.log(this.deepFormSignal.controls.name.value())
   });
}
```

Its important to note here the `controls` fields themselves are also technically proxied signals. This is partially because the `formSignal` and `deepFormSignal` methods accept a reactive form object OR a signal wrapping a reactive form object. Thus if the form object changes, we need to recreate the controls field to properly resemble the controls of the current form. This is also true for dynamically created forms:

-  form groups/records where the following methods are used
   -  .removeControl(...)
   -  .setControl(...)
   -  .addControl(...)
   -  etc...
-  form arrays where the following methods are used
   -  .push(...)
   -  .pop()
   -  etc...

The above methods update the value of validity of the reactive control, so the controls signal field recomputes (eagerly) on any new value or status change of the form. This could lead to a strange behavior where reacting to nested form signals would rerun on random form value/status changes which may not be intuitive. For this reason the controls field was also proxied so that looking up nested controls in a reactive context over the `controls` field evaluates the controls signal in an untracked, unless its explicitly evaluated in the reactive context.

That might sound confusing so heres an example:

```typescript
@Component({...})
export class DeepFormSignalExampleComponent {
   ...
   readonly addressStateEffect = effect(() => {
      console.log(this.deepFormSignal.controls.address.controls.state.value()) // will NOT log when name is set
   });
   readonly addressStateEffect2 = effect(() => {
      console.log(this.deepFormSignal.controls().address.controls.state.value()) // will log when name is set
   });

   ngOnInit() {
      setTimeout(() => {
         this.form.patchValue({name: 'test'})
      }, 5000)
   }
}
```

So moral of the story, its important to use the `controls()` syntax when you want your reactive context to run on a dynamically created/removed control, but be careful using that syntax everywhere as it may cause extra computations on auxillary value and status events

Dynamic form example:

```typescript
@Component({...})
export class DeepFormSignalDynamicExampleComponent {
    readonly form = input<
      FormGroup<{
         name: FormControl<string | null>;
         message?: FormControl<string | null> // Optional control added dynamically
      }>
    >(
      new FormGroup({
         name: new FormControl('Joe Smith', { validators: Validators.required }),
      })
   );

   readonly deepFormSignal = deepFormSignal(this.form)

   readonly messageEffect1 = effect(() => {
      console.log(this.deepFormSignal.controls.message.value()) // DOES NOT log when message control is added
   });
   readonly messageEffect2 = effect(() => {
      console.log(this.deepFormSignal.controls().message.value()) // Logs when message control is added
   });

   ngOnInit() {
      setTimeout(() => {
         this.form.addControl('message', new FormControl<string | null>('hi'))
      }, 5000)
   }
}
```

<a name="issues"/>

## Issues

If you identify any errors in the library, or have an idea for an improvement, please open
an [issue](https://github.com/Devin-Harris/ngx-form-signal/issues).
