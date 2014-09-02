## Memorandum

Simple logging utility with all the bells and whistles.

### Features

- color output (if output supports it) using ANSI codes
- timestamp (with timezone support, defaults to local)
- prettyprint JSON objects
- error traces

### Install

```sh
npm install memorandum
```

### Usage

```js
var log = require("memorandum")();

log.info("this is an information message");
log.warn("this is a warning message");
log.error(new TypeError());
log.debug("this is a debug message");
log.debug({ x: 1 });
log.debug({ x: 2 }, "other debug object");
```

### Constructor

When creating the log you can pass an optional `module id` to the constructor. This will show up in the log.

```js
var log = require("memorandum")("my module");

log.info("log message");
//   2014-09-02 17:22:00  my module  info: log message
```

### Methods

These are the methods available to log messages.

- **info**: display information messages
- **warn**: display warning messages
- **error**: display errors (with trace)
- **debug**: display debug messages or objects (as JSON)

### Settings

Settings can be changed globally. They allow you to tweak some parts of the log output.

```js
var memorandum = require("memorandum");

// default settings:
memorandum.settings.timestamp.timezone = null; // MomentJS timezone (null = local)
memorandum.settings.timestamp.format = "YYYY-MM-DD HH:mm:ss.SSS"; // MomentJS format
```
