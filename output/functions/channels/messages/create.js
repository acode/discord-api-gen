const io = require('io');

/**
 * Create Message
 * Post a message to a guild text or DM channel
 * Returns a [message](https://discord.com/developers/docs/resources/channel#message-object) object. Fires a [Message Create](https://discord.com/developers/docs/topics/gateway-events#message-create) Gateway event. See [message formatting](https://discord.com/developers/docs/reference#message-formatting) for more information on how to properly format messages.
 * 
 * To create a message as a reply to another message, apps can include a [`message_reference`](https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure) with a `message_id`. The `channel_id` and `guild_id` in the `message_reference` are optional, but will be validated if provided.
 * 
 * Files must be attached using a `multipart/form-data` body as described in [Uploading Files](https://discord.com/developers/docs/reference#uploading-files).
 * @param {string} channel_id The id of the channel
 * @param {string} content Message contents (up to 2000 characters)
 * @param {string} nonce Can be used to verify a message was sent (up to 25 characters), * Value will appear in the [Message Create event](https://discord.com/developers/docs/topics/gateway-events#message-create).
 * @param {boolean} tts `true` if this is a TTS message
 * @param {array} embeds Up to 10 `rich` embeds (up to 6000 characters), *  * @ {object} undefined 
 * @param {object} allowed_mentions Allowed mentions for the message
 * @param {object} message_reference Include to make your message a reply
 * @param {array} components Components to include with the message, *  * @ {object} action_row 
 * @param {array} sticker_ids IDs of up to 3 [stickers](https://discord.com/developers/docs/resources/sticker#sticker-object) in the server to send in the message, *  * @ {string} undefined 
 * @param {array} attachments Attachment objects with filename and description, * See [Uploading Files](https://discord.com/developers/docs/reference#uploading-files), *  * @ {object} attachment , *  * @   {string} filename , *  * @   {string} description , *  * @   {buffer} file 
 * @param {integer} flags [Message flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) combined as a [bitfield](https://en.wikipedia.org/wiki/Bit_field) (only `SUPPRESS_EMBEDS` and `SUPPRESS_NOTIFICATIONS` can be set)
 * @returns {object}
 */
module.exports = (channel_id, content = null, nonce = null, tts = null, embeds = null, allowed_mentions = null, message_reference = null, components = null, sticker_ids = null, attachments = null, flags = null) => {

  const supportsMultipart = true;
  const _method = 'POST';
  let _pathname = '/channels/{channel_id}/messages';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (channel_id !== null) { _pathParams['channel_id'] = channel_id; }
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

  const _bodyParams = {};
  if (content !== null) { _bodyParams['content'] = content; }
  if (nonce !== null) { _bodyParams['nonce'] = nonce; }
  if (tts !== null) { _bodyParams['tts'] = tts; }
  if (embeds !== null) { _bodyParams['embeds'] = embeds; }
  if (allowed_mentions !== null) { _bodyParams['allowed_mentions'] = allowed_mentions; }
  if (message_reference !== null) { _bodyParams['message_reference'] = message_reference; }
  if (components !== null) { _bodyParams['components'] = components; }
  if (sticker_ids !== null) { _bodyParams['sticker_ids'] = sticker_ids; }
  if (attachments !== null) { _bodyParams['attachments'] = attachments; }
  if (flags !== null) { _bodyParams['flags'] = flags; }

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
