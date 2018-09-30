cashbot.ai: nodejs
=========
[![Build Status](https://travis-ci.org/cashbot/cashbot-node.svg?branch=master)](https://travis-ci.org/cashbot/cashbot-node)

This library contains nodejs bindings for the cashbot.ai APIs. Each method in
the library is compatible with callbacks or Promises. Note: this is a server side library and not intended for use from the client side.

cashbot.ai is a monetization platform for conversational experiences. For more
information, please visit (https://cashbot.ai) or e-mail us at
[support@cashbot.ai](mailto://support@cashbot.ai).

API Keys
-----------

You will need an API key to access the cashbot.ai APIs. You can request a key by
either signing up (https://cashbot.ai/register) or e-mailing us at
[support@cashbot.ai](mailto://support@cashbot.ai).

Installation
-----------

```npm install --save cashbot```

Quick Start: Facebook Messenger
-----------

```
// load the cashbot.ai library
// -------------------------
var Cashbot = require('cashbot');

// initialize the cashbot client
// -------------------------
var cashbot = Cashbot.init('API_KEY');

// optionally print debug messages, leave debug: false if you do not want debug messages
// -------------------------
cashbot.setConfig({ debug: true });


// send cashbot.ai user demographic information to be used to personalize recommendations
// get a Facebook carousel with personalized recommendations for the user
// returns via callback function

// IT IS CRITICAL YOU REPLACE USER.ATTRIBUTE WITH YOUR USER'S INFORMATION
// USER.ID SHOULD BE THE UNIQUE PAGE SCOPED USER ID
// -------------------------
cashbot.postGetQuery(USER.ID, { timezone: USER.TIMEZONE, gender: USER.GENDER, locale: USER.LOCALE, first_name: USER.FIRST_NAME, last_name: USER.LAST_NAME, profile_pic: USER.PROFILE_PIC, n: 3, type: 'carousel', label: 'Take a Look' }, function(err, res) {
  console.log('err: ', err);
  // returns a formatted message body
  console.log('res: ', res);
});


// send cashbot.ai user demographic information to be used to personalize recommendations
// get a Facebook list with personalized recommendations for the user
// returns via promises

// IT IS CRITICAL YOU REPLACE USER.ATTRIBUTE WITH YOUR USER'S INFORMATION
// USER.ID SHOULD BE THE UNIQUE PAGE SCOPED USER ID
// -------------------------
cashbot.postGetQuery(USER.ID, { timezone: USER.TIMEZONE, gender: USER.GENDER, locale: USER.LOCALE, first_name: USER.FIRST_NAME, last_name: USER.LAST_NAME, profile_pic: USER.PROFILE_PIC, type: 'list' })
  .then(function(res) {
    // returns a formatted message body
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
```

Quick Start: APIs
-----------

```
// load the cashbot.ai library
// -------------------------
var Cashbot = require('cashbot');

// initialize the cashbot client
// -------------------------
var cashbot = Cashbot.init('API_KEY');

// optionally print debug messages, leave debug: false if you do not want debug messages
// -------------------------
cashbot.setConfig({ debug: true });


// send cashbot.ai user demographic information to be used to personalize recommendations
// get n=3 personalized recommendations for the user
// returns via callback function

// IT IS CRITICAL YOU REPLACE USER.ATTRIBUTE WITH YOUR USER'S INFORMATION
// USER.ID SHOULD BE THE UNIQUE PAGE SCOPED USER ID
// -------------------------
cashbot.postGetQuery(USER.ID, { timezone: USER.TIMEZONE, gender: USER.GENDER, locale: USER.LOCALE, first_name: USER.FIRST_NAME, last_name: USER.LAST_NAME, profile_pic: USER.PROFILE_PIC, n: 3, format: 'api' }, function(err, res) {
  console.log('err: ', err);
  // returns a formatted message body
  console.log('res: ', res);
});


// send cashbot.ai user demographic information to be used to personalize recommendations
// get n=1 personalized recommendations for the user
// returns via promises

// IT IS CRITICAL YOU REPLACE USER.ATTRIBUTE WITH YOUR USER'S INFORMATION
// USER.ID SHOULD BE THE UNIQUE PAGE SCOPED USER ID
// -------------------------
cashbot.postGetQuery(USER.ID, { timezone: USER.TIMEZONE, gender: USER.GENDER, locale: USER.LOCALE, first_name: USER.FIRST_NAME, last_name: USER.LAST_NAME, profile_pic: USER.PROFILE_PIC, n: 1, format: 'api' })
  .then(function(res) {
    // returns a formatted message body
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
```

userDemographics Object
-----------

```
  required
    timezone: signed integer, offset from GMT
    gender: enumerated string, [ "male", "female" ]
    locale: Facebook locale code, e.g. "en_US"
  optional
    first_name: string
    last_name: string
    profile_pic: string, URL to profile picture
```

Tests
-----

These are a work in progress

  npm install
  npm test

Contributing
-----

Please follow the existing coding style and add unit tests for any new or changed functionality. 

License
-------------------

Released under the MIT license.  See file called LICENSE for more details.

Attribution/Credits
-------------------

Inspired by the Mixpanel nodejs library
(http://mixpanel.com/)
(https://github.com/mixpanel/mixpanel-node)

Copyright (c) 2014-15 Mixpanel
Original Library Copyright (c) 2012-14 Carl Sverre
