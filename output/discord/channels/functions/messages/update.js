const io = require('io');

/**
 * Edit Message
 * Edit a previously sent message
 * The fields `content`, `embeds`, and `flags` can be edited by the original message author. Other users can only edit `flags` and only if they have the `MANAGE_MESSAGES` permission in the corresponding channel. When specifying flags, ensure to include all previously set flags/bits in addition to ones that you are modifying. Only `flags` documented in the table below may be modified by users (unsupported flag changes are currently ignored without error).
 * 
 * When the `content` field is edited, the `mentions` array in the message object will be reconstructed from scratch based on the new content. The `allowed_mentions` field of the edit request controls how this happens. If there is no explicit `allowed_mentions` in the edit request, the content will be parsed with _default_ allowances, that is, without regard to whether or not an `allowed_mentions` was present in the request that originally created the message.
 * 
 * Returns a [message](https://discord.com/developers/docs/resources/channel#message-object) object. Fires a [Message Update](https://discord.com/developers/docs/topics/gateway-events#message-update) Gateway event.
 * 
 * Refer to [Uploading Files](https://discord.com/developers/docs/reference#uploading-files) for details on attachments and `multipart/form-data` requests.
 * Any provided files will be **appended** to the message. To remove or replace files you will have to supply the `attachments` field which specifies the files to retain on the message after edit.
 * @param {string} channel_id The id of the channel
 * @param {string} message_id Id of the message
 * @param {string} content Message contents (up to 2000 characters)
 * @param {array} embeds Up to 10 `rich` embeds (up to 6000 characters), *  * @ {object} undefined 
 * @param {integer} flags Edit the [flags](https://discord.com/developers/docs/resources/channel#message-object-message-flags) of a message (only `SUPPRESS_EMBEDS` can currently be set/unset)
 * @param {object} allowed_mentions Allowed mentions for the message
 * @param {array} components Components to include with the message, *  * @ {object} action_row 
 * @param {array} attachments Attached files to keep and possible descriptions for new files, * See [Uploading Files](https://discord.com/developers/docs/reference#uploading-files), *  * @ {object} attachment , *  * @   {string} filename , *  * @   {string} description , *  * @   {buffer} file 
 * @returns {object}
 */
module.exports = async (channel_id, message_id, content = null, embeds = null, flags = null, allowed_mentions = null, components = null, attachments = null) => {

  const supportsMultipart = true;
  const _method = 'PATCH';
  let _pathname = '/channels/{channel_id}/messages/{message_id}';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (channel_id !== null) { _pathParams['channel_id'] = channel_id; }
  if (message_id !== null) { _pathParams['message_id'] = message_id; }
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
  if (embeds !== null) { _bodyParams['embeds'] = embeds; }
  if (flags !== null) { _bodyParams['flags'] = flags; }
  if (allowed_mentions !== null) { _bodyParams['allowed_mentions'] = allowed_mentions; }
  if (components !== null) { _bodyParams['components'] = components; }
  if (attachments !== null) { _bodyParams['attachments'] = attachments; }

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
