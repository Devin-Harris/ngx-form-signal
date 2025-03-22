# ngx-form-signal

Signal based form api for angular.

The goal of NgxFormSignal is to allow easy conversion from existing form objects to reactive signal primitives. This gives developers the ability to derive state off an existing form object as well as react to form state changes such as dirty, invalid, touched, etc... while remaining in the signal realm.

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

The main helper function in this library is the `formSignal` function. Simply passing a form object or a signal wrapping a form object to this function will perform all the necessary subscriptions, effects, and signal creations for all the form fields you typically want to track changes to.

The `formSignal` method also allows additional options to be passed in such as the injector reference (since it internally uses effects you must be in an injection context when using the method), or equality functions for the signals created internally, so you can define how and when reactions to those signals changes should fire.

There is also a `deepFormSignal` which works similarly to the `formSignal`, with the main caveat being it recursively builds form signals for all nested FormGroups and FormArrays. This way you can essentially create a formSignal for every control in the overall form with a single function call, and access them from a single variable.

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

Now imagine you want to react to changes to this form for some purpose. For this example maybe I want to show a warning message when a name is being provided that is already in some other list of users names.

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

This can sometimes feel a little clunky. This is especially true if you are getting the form object or even the list of existing names over an input property. In this case you need to tracked the valueChanges subscription reference then unsubscribe and resubscribe every time the form object changes (most likely by tying into the ngOnChanges lifecycle method).

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
   readonly someListOfExistingNames: string[] = input([...]);

   /**
    * Passing the signal with the form object as its value to the `formSignal` method
    * gives us a FormSignal typed variable
    */
   readonly formSignal = formSignal(this.form)

   readonly showDuplicateNameWarning: boolean = computed(() => {
      // Notice how formSignal has a `value` signal inside it that will be set internally when the form changes or its valueChanges
      const name = this.formSignal.value().name
      return this.someListOfExistingNames().some(n => n.toLowerCase() === name.toLowerCase())
   });
}
```

In the above example we are technically subscribing to the whole forms valuechanges which is slightly different from the example before. You can simple update this by passing the name control to the `formSignal` helper method instead if you so choose.

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
   readonly someListOfExistingNames: string[] = input([...]);

   // Building form signal for just the name control
   readonly nameControlSignal = formSignal(this.nameControl)

   readonly showDuplicateNameWarning: boolean = computed(() => {
      // Just using name controls value
      const name = this.nameControlSignal.value()
      return this.someListOfExistingNames().some(n => n.toLowerCase() === name.toLowerCase())
   });
}
```

Note you also can pass a normal form object instead of a signal wrapped form object if you have a statically defined form

As you can see with this approach we are driving our state computations solely off the signal primitives and we are reacting to potential changes to the form object, the forms value, and even other inputs coming into our components. This also removes the need for a lot of cleanup steps such as unsubscribing from form subscriptions or tying into lifecycle methods such as ngOnChanges.

Of course the compnents formSignal object has many other signal fields you can utilize as well.

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
    * Shows the form signal object itself is a signal, that return a snapshot of the value of all the internal signals listed above
    * Useful for when you want to run some logic whenever anything on the form changes
    */
   readonly formSignalEffect = effect(() => {
      console.log(this.formSignal())
   })
}
```

<a name="deepFormSignal"/>

### Deep Form Signal example

This library also supports recursively creating form signals for a more nested form using the `deepFormSignal` method. This method, like `formSignal`, takes in a form or signal wrapped form and build a `formSignal` for each FormControl, FormGroup, and FormArray in the form. FormGroups and FormArrays then get an additional `children` property added to them which have the nested formsignals of their children controls. This is useful for when you have a form object with many levels and want to create form signals for many/all of those levels with a single function call.

Heres a quick example on how this looks:

```typescript
@Component({...})
export class DeepFormSignalExampleComponent {
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
    * defined above and add the street, state, zip formsignals to the address DeepFormSignals children array
    */
   readonly deepFormSignal = deepFormSignal(this.form)

   readonly addressEffect = effect(() => {
      console.log(this.deepFormSignal.children.address.value())
   });
   readonly addressStateEffect = effect(() => {
      console.log(this.deepFormSignal.children.address.children.state.value())
   });
   readonly addressStreetEffect = effect(() => {
      console.log(this.deepFormSignal.children.address.children.street.value())
   });
   readonly addressZipEffect = effect(() => {
      console.log(this.deepFormSignal.children.address.children.zip.value())
   });
   readonly emailEffect = effect(() => {
      console.log(this.deepFormSignal.children.email.value())
   });
   readonly messageEffect = effect(() => {
      console.log(this.deepFormSignal.children.message.value())
   });
   readonly nameEffect = effect(() => {
      console.log(this.deepFormSignal.children.name.value())
   });
}
```

The one caveat with the deepformsignal is in the options equalityFns input. In a normal formSignal you can define the valueEqualityFn which will determine when the underlying value and rawValue signals have actually changed and attempt to notify dependent signals. In a deep signal this option is not available as the valueEqualityFn is based on a different type for each formSignal created, so defining a single one for the overall deepFormSignal and passing that down to each internal formSignal does not make sense. Note for this complex fields such as touched, dirty, etc... the deepFormSignal still allows equalityFns for these, and setting them will override them for all the touched, dirty, etc... signals on all the internal formSignals created.

<a name="issues"/>

## Issues

If you identify any errors in the library, or have an idea for an improvement, please open
an [issue](https://github.com/Devin-Harris/ngx-form-signal/issues).
