const io = require('io');

/**
 * Execute Slack-Compatible Webhook
 * Refer to [Slack's documentation](https://api.slack.com/incoming-webhooks) for more information
 * We do not support Slack's `channel`, `icon_emoji`, `mrkdwn`, or `mrkdwn_in` properties.
 * @param {string} webhook_id The id of the webhook
 * @param {string} webhook_token The secure token of the webhook (returned for Incoming Webhooks)
 * @param {string} thread_id Id of the thread to send the message in
 * @param {boolean} wait Waits for server confirmation of message send before response (defaults to `true`; when `false` a message that is not saved does not return an error)
 * @returns {object}
 */
module.exports = async (webhook_id, webhook_token, thread_id = null, wait = null, context) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/webhooks/{webhook_id}/{webhook_token}/slack';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (webhook_id !== null) { _pathParams['webhook_id'] = webhook_id; }
  if (webhook_token !== null) { _pathParams['webhook_token'] = webhook_token; }
  _pathParams['application_id'] = _providerAuth.clientId;
  _pathname = _pathname.replace(/\{(.*?)\}/gi, ($0, $1) => {
    let name = $1;
    if (!_pathParams[name]) {
      throw new Error(`Missing required parameter: "${name}"`);
    }
    return encodeURIComponent(_pathParams[name]);
  });

  const _url = `https://${process.env.API_URL}/${_pathname}`;
  const _headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bot ${_providerAuth.botToken}`,
    'Accept': 'application/json'
  };

  const _queryParams = {};
  if (thread_id !== null) { _queryParams['thread_id'] = thread_id; }
  if (wait !== null) { _queryParams['wait'] = wait; }

  const _bodyParams = {};

  let _result;
  if (supportsMultipart && _bodyParams.attachments && _bodyParams.attachments.length) {
    let formData = {};
    _bodyParams.attachments.forEach((attachment, i) => {
      let file = attachment.file;
      file.filename = attachment.filename;
      formData[`files[${i}]`] = file;
      delete attachment.file;
      attachment.id = i;
    });
    formData['payload_json'] = _bodyParams;
    _result = await io.submit(_method, _url, _queryParams, _headers, formData);
  } else {
    _result = await io.request(_method, _url, _queryParams, _headers, JSON.stringify(_bodyParams));
  }

  let _parsedData;
  try {
    _parsedData = _result.body.length ? JSON.parse(_result.body.toString()) : {};
  } catch (e) {
    _parsedData = {};
  }

  if (
    Math.floor(_result.statusCode / 100) !== 2 &&
    Math.floor(_result.statusCode / 100) !== 3
  ) {
    if (_parsedData) {
      let err = [];
      if (_parsedData.message) {
        err.push(_parsedData.message);
      }
      if (_parsedData.code) {
        err.push(`: code ${_parsedData.code}:`);
      }
      let error = new Error(err.join(''));
      error.details = _parsedData.errors;
      throw error;
    }
    throw new Error('Error connecting to Discord, please try again.');
  }

  return _parsedData;

};
