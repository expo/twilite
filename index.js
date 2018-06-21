let fetch = require('node-fetch');
let FormData = require('form-data');
let phone = require('phone');

class Twilite {
  /**
   * An object that you can call a method on to send SMS messages
   *
   * @param {string} AccountSid Your Twilio AccountSid like ACXXXXXXXXXX
   * @param {string} AuthToken The AuthToken for your account like 178327482abc342
   * @param {string} [From] The Twilio phone number to send from by default
   * @param {object} [opts] {AccountSid, AuthToken, From, API_BASE_URL} Can be anywhere after the other arguments
   *
   */
  constructor(AccountSid, AuthToken, From, opts) {
    opts = _optsFromArgs(arguments, ['AccountSid', 'AuthToken', 'From']);
    Object.assign(this, opts);
    this.API_BASE_URL = this.API_BASE_URL || 'https://api.twilio.com/2010-04-01/';
  }

  _accountBaseUrl() {
    return this.API_BASE_URL + 'Accounts/' + this.AccountSid + '/';
  }

  _messagesUrl() {
    return this._accountBaseUrl() + 'Messages.json';
  }

  _encode(params) {
    let s = [];
    for (let k in params) {
      if (params.hasOwnProperty(k)) {
        s.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    }
    return s.join('&');
  }

  _normalizeNumber(n, for_) {
    let [nn, country] = phone(n);
    if (!nn) {
      let e = new Error('Invalid phone number for ' + for_ + ': ' + n);
      e.code = 'INVALID_PHONE_NUMBER';
      e.number = n;
      throw e;
    }
    return nn;
  }

  /**
   * Sends a message using a POST to the Twilio API
   *
   * @param {string} To The phone number to send to
   * @param {string} Body The text of the message you want to send (will default to a test message)
   * @param {string} [MediaUrl] The URL of media you want to attach, if any. Ex. http://ccheever.com/Duckling.png
   * @param {object} [params] {Body, From, MediaUrl, To}
   *
   */
  async sendMessageAsync(To, Body, MediaUrl, params) {
    // curl -X POST https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages.json \
    //      --data-urlencode "Body=Let's grab lunch at Milliways tomorrow!" \
    //      --data-urlencode "From=+14158141829" \
    //      --data-urlencode "MediaUrl=http://www.example.com/cheeseburger.png" \
    //      --data-urlencode "To=+15558675310" \
    //      -u ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX:your_auth_token
    params = _optsFromArgs(arguments, ['To', 'Body', 'MediaUrl']);
    let postParams = Object.assign(
      {
        From: this.From,
        Body: 'Test from Twilio at ' + new Date(),
      },
      params
    );

    postParams.From = this._normalizeNumber(postParams.From, 'From');
    postParams.To = this._normalizeNumber(postParams.To, 'To');

    let form = new FormData();
    for (let k in postParams) {
      if (postParams.hasOwnProperty(k)) {
        form.append(k, postParams[k]);
      }
    }

    let auth = this.AccountSid + ':' + this.AuthToken;

    let response = await fetch(this._messagesUrl(), {
      method: 'POST',
      body: form,
      headers: {
        authorization: `Basic ${new Buffer(auth).toString('base64')}`,
      },
    });
    let result = await response.json();
    return result;
  }
}

function _optsFromArgs(args, params) {
  let opts = {};
  for (let i = 0; i < args.length; i++) {
    let o = args[i];
    if (typeof o === 'object') {
      Object.assign(opts, o);
    } else {
      let k = params[i];
      if (!k) {
        throw new Error('Wrong number of arguments. Expected: ' + params);
      }
      opts[k] = o;
    }
  }
  return opts;
}


module.exports = (...args) => new Twilite(...args);
