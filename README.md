# twilite

Lightweight Twilio client that only sends SMS messages.

## Usage

### Minimal Example of Sending a Test Message

```javascript

let twilite = require('twilite');

let tw = twilite('ACXXX_YOUR_AccountSid_XXX', '79593_YOUR_AuthToken_XXX', '+14125551212');
await tw.sendMessageAsync({To: '+16505551212'});

```

### Using More Options

```javascript

let twilite = require('twilite');

let tw = twilite({
        AccountSid: 'ACXXX_AccountSid_XXX', // Your AccountSid
        AuthToken: '23424ab_AuthToken_', // Your AuthToken
        From: '412-555-1212', // Default From # (optional)
    });
    
await tw.sendMessageAsync({
    To: '650-555-1212', // # to send the message to
    Body: "This is the content of the message.",
    MediaUrl: 'http://ccheever.com/Duckling.png',
    From: '412-555-1212', // A Twilio phone # that the account you're using controls
})

```
