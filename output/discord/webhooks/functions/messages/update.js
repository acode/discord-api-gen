const io = require('io');

/**
 * Edit Webhook Message
 * Edits a previously-sent webhook message from the same token
 * Returns a [message](https://discord.com/developers/docs/resources/channel#message-object) object on success.
 * When the `content` field is edited, the `mentions` array in the message object will be reconstructed from scratch based on the new content. The `allowed_mentions` field of the edit request controls how this happens. If there is no explicit `allowed_mentions` in the edit request, the content will be parsed with _default_ allowances, that is, without regard to whether or not an `allowed_mentions` was present in the request that originally created the message.
 * Refer to [Uploading Files](https://discord.com/developers/docs/reference#uploading-files) for details on attachments and `multipart/form-data` requests.
 * Any provided files will be **appended** to the message. To remove or replace files you will have to supply the `attachments` field which specifies the files to retain on the message after edit.
 * @param {string} webhook_id The id of the webhook
 * @param {string} webhook_token The secure token of the webhook (returned for Incoming Webhooks)
 * @param {string} message_id Id of the message
 * @param {string} thread_id Id of the thread the message is in
 * @param {string} content The message contents (up to 2000 characters)
 * @param {array} embeds Embedded `rich` content
 * @ {object}  
 * @param {object} allowed_mentions Allowed mentions for the message
 * @param {array} components The components to include with the message
 * @ {object} action_row 
 * @param {array} attachments Attached files to keep and possible descriptions for new files
 * @ {object} attachment 
 * @   {string} filename 
 * @   {string} description 
 * @   {buffer} file 
 * @returns {object}
 */
module.exports = async (webhook_id, webhook_token, message_id, thread_id = null, content = null, embeds = null, allowed_mentions = null, components = null, attachments = null, context) => {

  const supportsMultipart = true;
  const _method = 'PATCH';
  let _pathname = '/webhooks/{webhook_id}/{webhook_token}/messages/{message_id}';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (webhook_id !== null) { _pathParams['webhook_id'] = webhook_id; }
  if (webhook_token !== null) { _pathParams['webhook_token'] = webhook_token; }
  if (message_id !== null) { _pathParams['message_id'] = message_id; }
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

  const _bodyParams = {};
  if (content !== null) { _bodyParams['content'] = content; }
  if (embeds !== null) { _bodyParams['embeds'] = embeds; }
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
