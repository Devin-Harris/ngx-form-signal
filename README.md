# ngx-form-signal

Signal based form api for angular.

The goal of NgxFormSignal is to allow easy conversion from existing form objects to reactive signal primitives. This gives developers the ability to derive state off an existing form object as well as react to form state changes such as dirty, invalid, touched, etc... while remaining in the signal realm.

---

## Table of Contents

-  [Installation](#installation)
-  [Basic Concepts](#basics)
-  [Usage](#usage)
   -  [Simple Example](#simple)
   -  [Form Array Example](#formArray)
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

In the above example you can see how we are driving our state computations solely off the signal primitives and we are reacting to potential changes to the form object, the forms value, and even other inputs coming into our components. This also removes the need for a lot of cleanup steps such as unsubscribing from form subscriptions or tying into lifecycle methods such as ngOnChanges.

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

<a name="formArray"/>

### Form Array example

...

<a name="deepFormSignal"/>

### Deep Form Signal example

...

<a name="issues"/>

## Issues

If you identify any errors in the library, or have an idea for an improvement, please open
an [issue](https://github.com/Devin-Harris/ngx-form-signal/issues).
