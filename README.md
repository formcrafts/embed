## Introduction

You can use Formcrafts' embed library `@formcrafts/embed` to embed forms using vanilla JavaScript. The library is available as an npm package, and works well with frameworks like Svelte, React, Vue, and Angular.

## Installation

To add the Formcrafts JavaScript library to your project, install it using npm:

```shellscript
npm install @formcrafts/embed --save
```

## Importing the library

To make the library available in your code, import the necessary modules:

```javascript
import { createInlineForm, createPopup } from "@formcrafts/embed"
```

## Embed - Inline

### Initialize the form

```javascript
const myInlineForm = createInlineForm({
  form: "form_key", // Your form key
  target: document.getElementById("element_id"), // Target element
  seamless: true, // Removes form border, shadow, and padding
  width: 500, // Max width of the form
  redirectWithin: true, // Keep redirect within form frame
  values: {
    field1: "Jack Smith",
    field2: ["Chocolate", "Vanilla"],
  }, // Prefill values
})
```

### Available methods

You can use the following methods to interact with the inline form:

```javascript
myInlineForm.on("load", (height: number) => {}) // Fires when the form loads
myInlineForm.on("submit:success", () => {}) // Fires on a successful form submit
myInlineForm.destroy() // Remove the form instance
myInlineForm.values({
  field1: "New value",
}) // Update the values of the form
```

## Embed - Popup

### Initialize the form

```javascript
const myPopupForm = createPopup({
  form: "form_key", // Your form key
  width: 500, // Max width of the form
  redirectWithin: true, // Keep redirect within form frame
  values: {
    field1: "Jack Smith",
    field2: ["Chocolate", "Vanilla"],
  }, // Prefill values
})
```

### Available methods

You can use the following methods to interact with the popup form:

```javascript
myPopupForm.on("load", (height: number) => {}) // Fires when the form loads
myPopupForm.on("submit:success", () => {}) // Fires on a successful form submit
myPopupForm.load() // Load the form. Can be used to load the form before showing it. Optional.
myPopupForm.open() // Open the popup
myPopupForm.close() // Close the popup
myPopupForm.destroy() // Destroy the popup and the form instance
myPopupForm.values({
  field1: "New value",
}) // Update the values of the form
```
