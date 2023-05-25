const io = require('io');

/**
 * Create Channel Invite
 * Create a new [invite](https://discord.com/developers/docs/resources/invite#invite-object) object for the channel
 * Only usable for guild channels. Requires the `CREATE_INSTANT_INVITE` permission. All JSON parameters for this route are optional, however the request body is not. If you are not sending any fields, you still have to send an empty JSON object (`{}`). Returns an [invite](https://discord.com/developers/docs/resources/invite#invite-object) object. Fires an [Invite Create](https://discord.com/developers/docs/topics/gateway-events#invite-create) Gateway event.
 * @param {string} channel_id The id of the channel
 * @param {integer} max_age Duration of invite in seconds before expiry, or 0 for never, * between 0 and 604800 (7 days)
 * @param {integer} max_uses Max number of uses or 0 for unlimited, * between 0 and 100
 * @param {boolean} temporary Whether this invite only grants temporary membership
 * @param {boolean} unique If true, don't try to reuse a similar invite (useful for creating many unique one time use invites)
 * @param {integer} target_type The [type of target](https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types) for this voice channel invite
 * @param {string} target_user_id The id of the user whose stream to display for this invite, required if `target_type` is 1, the user must be streaming in the channel
 * @param {string} target_application_id The id of the embedded application to open for this invite, required if `target_type` is 2, the application must have the `EMBEDDED` flag
 * @returns {object}
 */
module.exports = async (channel_id, max_age, max_uses, temporary, unique, target_type, target_user_id, target_application_id) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/channels/{channel_id}/invites';

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
  if (max_age !== null) { _bodyParams['max_age'] = max_age; }
  if (max_uses !== null) { _bodyParams['max_uses'] = max_uses; }
  if (temporary !== null) { _bodyParams['temporary'] = temporary; }
  if (unique !== null) { _bodyParams['unique'] = unique; }
  if (target_type !== null) { _bodyParams['target_type'] = target_type; }
  if (target_user_id !== null) { _bodyParams['target_user_id'] = target_user_id; }
  if (target_application_id !== null) { _bodyParams['target_application_id'] = target_application_id; }

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
