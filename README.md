# Casement: a logical, minimalistic iFrame communication library

## Purpose
I'll explain it this way: An app exists in an iFrame. The app needs to communicate with its container window. The app is sandboxed, so it can't access the container window's APIs. Casement provides a simple API for sending messages between the two, in either direction.

## Installation
Casement is available on NPM. You can install it with `npm install casement`.

## Who is it for?
Casement is very opinionated out of pure simplicity. There are no fancy functions, just Promise-based APIs and automatic event handler management. It's for people who want to get the job done with minimal fuss, and don't need a lot of bells and whistles.

## Usage
Casement is a singleton. You can import it into your app like this:

```javascript
// ES6
import casement from 'casement';
// CommonJS
const casement = require('casement');
```
If you need to only use one part of it, you can just import that part:
```javascript
// ES6
import { Inside } from 'casement';
// CommonJS
const { Inside } = require('casement');
```

The `Inside` and `Outside` classes are almost the same, except the `Outside` class has methods for creation and destruction of the iFrame. The `Inside` class is for the app inside the iFrame, and the `Outside` class is for the container window.

### Outside
The `Outside` class has three methods and a constructor. 

#### Constructor
The constructor takes an object as its argument.
  
  ```javascript
  const outside = new Outside({
    // the name of the casement instance
    name: 'myCasement',
    // the URL of the iFrame, used for iFrame creation, and also for checking the origin of incoming messages
    pageUrl: 'https://example.com',
    // The container for a new iFrame, optional if you're attaching a pre-existing iFrame
    container: document.body,
    // A pre-existing iFrame, if you'd like to attach one instead of using a Casement-created one
    iframe: document.getElementById('myIframe'),
    // What to do when communication is established
    onReady: () => {
      console.log('Casement is ready!');
    },
    // Message handler, technically optional, but you'll want to use it
    onMessage: (message) => {
      console.log(message);
    }
    // 
  })
  ```

#### Sending messages
You can send anything, and there is only one argument allowed for the `send` method. That argument is the content of the message.

```javascript
const outside = new Outside( ... );
outside.send('Hello, world!');
```

#### Requesting things
The `.send()` method is a one-way communication method. If you want to get a response, you'll need to use the `.request()` method. It also takes one argument, same as `.send()`, but it returns a Promise that resolves with the response.

```javascript
const outside = new Outside( ... );
outside.request('What is your name?').then((response) => {
  console.log(response);
});
```