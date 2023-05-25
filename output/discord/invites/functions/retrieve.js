const io = require('io');

/**
 * Get Invite
 * Returns an [invite](https://discord.com/developers/docs/resources/invite#invite-object) object for the given code.
 * @param {string} invite_code The invite code (unique ID)
 * @param {boolean} with_counts Whether the invite should contain approximate member counts
 * @param {boolean} with_expiration Whether the invite should contain the expiration date
 * @param {string} guild_scheduled_event_id The guild scheduled event to include with the invite
 * @returns {object}
 */
module.exports = async (invite_code, with_counts = null, with_expiration = null, guild_scheduled_event_id = null, context) => {

  const supportsMultipart = false;
  const _method = 'GET';
  let _pathname = '/invites/{invite_code}';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (invite_code !== null) { _pathParams['invite_code'] = invite_code; }
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
  if (with_counts !== null) { _queryParams['with_counts'] = with_counts; }
  if (with_expiration !== null) { _queryParams['with_expiration'] = with_expiration; }
  if (guild_scheduled_event_id !== null) { _queryParams['guild_scheduled_event_id'] = guild_scheduled_event_id; }

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
