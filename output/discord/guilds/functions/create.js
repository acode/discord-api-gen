const io = require('io');

/**
 * Create Guild
 * Create a new guild
 * Returns a [guild](https://discord.com/developers/docs/resources/guild#guild-object) object on success. Fires a [Guild Create](https://discord.com/developers/docs/topics/gateway-events#guild-create) Gateway event.
 * @param {string} name Name of the guild (2-100 characters)
 * @param {string} region [voice region](#https://discord.com/developers/docs/resources/voicevoice-region-object) id (deprecated)
 * @param {object} icon Base64 128x128 image for the guild icon
 * @param {integer} verification_level [verification level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level)
 * @param {integer} default_message_notifications Default [message notification level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level)
 * @param {integer} explicit_content_filter [explicit content filter level](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level)
 * @param {array} roles New guild roles
 * @ {object}  
 * @param {array} channels New guild's channels
 * @ {object}  
 * @param {string} afk_channel_id Id for afk channel
 * @param {integer} afk_timeout Afk timeout in seconds, can be set to: 60, 300, 900, 1800, 3600
 * @param {string} system_channel_id The id of the channel where guild notices such as welcome messages and boost events are posted
 * @param {integer} system_channel_flags [system channel flags](https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags)
 * @returns {object}
 */
module.exports = async (name, region = null, icon = null, verification_level = null, default_message_notifications = null, explicit_content_filter = null, roles = null, channels = null, afk_channel_id = null, afk_timeout = null, system_channel_id = null, system_channel_flags = null, context) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/guilds';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {
    botToken: process.env.DISCORD_BOT_TOKEN, // for debugging
    clientId: process.env.DISCORD_CLIENT_ID // for debugging
  };
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};

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

  const _bodyParams = {};
  if (name !== null) { _bodyParams['name'] = name; }
  if (region !== null) { _bodyParams['region'] = region; }
  if (icon !== null) { _bodyParams['icon'] = icon; }
  if (verification_level !== null) { _bodyParams['verification_level'] = verification_level; }
  if (default_message_notifications !== null) { _bodyParams['default_message_notifications'] = default_message_notifications; }
  if (explicit_content_filter !== null) { _bodyParams['explicit_content_filter'] = explicit_content_filter; }
  if (roles !== null) { _bodyParams['roles'] = roles; }
  if (channels !== null) { _bodyParams['channels'] = channels; }
  if (afk_channel_id !== null) { _bodyParams['afk_channel_id'] = afk_channel_id; }
  if (afk_timeout !== null) { _bodyParams['afk_timeout'] = afk_timeout; }
  if (system_channel_id !== null) { _bodyParams['system_channel_id'] = system_channel_id; }
  if (system_channel_flags !== null) { _bodyParams['system_channel_flags'] = system_channel_flags; }

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
