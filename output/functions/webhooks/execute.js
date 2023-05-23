const io = require('io');

/**
 * Execute Webhook
 * Refer to [Uploading Files](https://discord.com/developers/docs/reference#uploading-files) for details on attachments and `multipart/form-data` requests
 * Returns a message or `204 No Content` depending on the `wait` query parameter.
 * @param {string} webhook_id The id of the webhook
 * @param {string} webhook_token The secure token of the webhook (returned for Incoming Webhooks)
 * @param {boolean} wait Waits for server confirmation of message send before response, and returns the created message body (defaults to `false`; when `false` a message that is not saved does not return an error)
 * @param {string} thread_id Send a message to the specified thread within a webhook's channel, * The thread will automatically be unarchived.
 * @param {string} content The message contents (up to 2000 characters)
 * @param {string} username Override the default username of the webhook
 * @param {string} avatar_url Override the default avatar of the webhook
 * @param {boolean} tts True if this is a TTS message
 * @param {array} embeds Embedded `rich` content, *  * @ {object} undefined 
 * @param {object} allowed_mentions Allowed mentions for the message
 * @param {array} components The components to include with the message, *  * @ {object} action_row 
 * @param {array} attachments Attachment objects with filename and description, *  * @ {object} attachment , *  * @   {string} filename , *  * @   {string} description , *  * @   {buffer} file 
 * @param {integer} flags [message flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) combined as a [bitfield](https://en.wikipedia.org/wiki/Bit_field) (only `SUPPRESS_EMBEDS` can be set)
 * @param {string} thread_name Name of thread to create (requires the webhook channel to be a forum channel)
 * @returns {object}
 */
module.exports = (webhook_id, webhook_token, wait = null, thread_id = null, content = null, username = null, avatar_url = null, tts = null, embeds = null, allowed_mentions = null, components = null, attachments = null, flags = null, thread_name = null) => {

  const supportsMultipart = true;
  const _method = 'POST';
  let _pathname = '/webhooks/{webhook_id}/{webhook_token}';

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
    return _pathParams[name];
  });

  const _url = `https://${process.env.API_URL}/${_pathname}`;
  const _headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bot ${_providerAuth.botToken}`,
    'Accept': 'application/json'
  };

  const _queryParams = {};
  if (wait !== null) { _queryParams['wait'] = wait; }
  if (thread_id !== null) { _queryParams['thread_id'] = thread_id; }

  const _bodyParams = {};
  if (content !== null) { _bodyParams['content'] = content; }
  if (username !== null) { _bodyParams['username'] = username; }
  if (avatar_url !== null) { _bodyParams['avatar_url'] = avatar_url; }
  if (tts !== null) { _bodyParams['tts'] = tts; }
  if (embeds !== null) { _bodyParams['embeds'] = embeds; }
  if (allowed_mentions !== null) { _bodyParams['allowed_mentions'] = allowed_mentions; }
  if (components !== null) { _bodyParams['components'] = components; }
  if (attachments !== null) { _bodyParams['attachments'] = attachments; }
  if (flags !== null) { _bodyParams['flags'] = flags; }
  if (thread_name !== null) { _bodyParams['thread_name'] = thread_name; }

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
