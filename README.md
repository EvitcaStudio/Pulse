# Pulse Module
A plugin that allows you to add event listeners on objects. Have your code called alongside an event!

## Installation

### ES Module

```js
import { Pulse } from './pulse.mjs';
```

### IIFE (Immediately Invoked Function Expression)

```js
<script src="pulse.js"></script>;
// ...
window.PulseBundle.Pulse;
```

### CommonJS (CJS) Module

```js
const { Pulse } = require('./pulse.cjs.js');
```

### Global Dependency

Pulse relies on the `VYLO` variable being globally accessible.