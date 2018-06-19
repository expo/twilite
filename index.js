let fetch = require('node-fetch');
let FormData = require('form-data');
let phone = require('phone');

class Twilite {
  /**
   *
   * @param {*} opts {AccountSid, AuthToken, From, API_BASE_URL}
   */
  constructor(...args) {
    let opts = args[args.length - 1];
    opts = (typeof opts === 'object' && opts) || {};
    Object.assign(this, opts);
    this.API_BASE_URL = this.API_BASE_URL || 'https://api.twilio.com/2010-04-01/';
    this.AccountSid = this.AccountSid || args[0];
    this.AuthToken = this.AuthToken || args[1];
    this.From = this.From || args[2];
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
   * @param {*} params {Body, From, MediaUrl, To}
   */
  async sendMessageAsync(params) {
    // curl -X POST https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages.json \
    //      --data-urlencode "Body=Let's grab lunch at Milliways tomorrow!" \
    //      --data-urlencode "From=+14158141829" \
    //      --data-urlencode "MediaUrl=http://www.example.com/cheeseburger.png" \
    //      --data-urlencode "To=+15558675310" \
    //      -u ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX:your_auth_token
    let postParams = {
      ...{
        From: this.From,
        Body: 'Test from Twilio at ' + new Date(),
      },
      ...params,
    };

    postParams.From = this._normalizeNumber(postParams.From, 'From');
    postParams.To = this._normalizeNumber(postParams.To, 'To');

    let form = new FormData();
    for (let k in postParams) {
      if (postParams.hasOwnProperty(k)) {
        form.append(k, postParams[k]);
      }
    }

    let auth = this.AccountSid + ':' + this.AuthToken;
    console.log(postParams);
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

module.exports = (...args) => new Twilite(...args);
