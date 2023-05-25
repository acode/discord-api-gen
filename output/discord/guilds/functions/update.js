const io = require('io');

/**
 * Modify Guild
 * Modify a guild's settings
 * Requires the `MANAGE_GUILD` permission. Returns the updated [guild](https://discord.com/developers/docs/resources/guild#guild-object) object on success. Fires a [Guild Update](https://discord.com/developers/docs/topics/gateway-events#guild-update) Gateway event.
 * @param {string} guild_id Guild id
 * @param {string} name Guild name
 * @param {string} region Guild [voice region](#https://discord.com/developers/docs/resources/voicevoice-region-object) id (deprecated)
 * @param {integer} verification_level [verification level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level)
 * @param {integer} default_message_notifications Default [message notification level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level)
 * @param {integer} explicit_content_filter [explicit content filter level](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level)
 * @param {string} afk_channel_id Id for afk channel
 * @param {integer} afk_timeout Afk timeout in seconds, can be set to: 60, 300, 900, 1800, 3600
 * @param {object} icon Base64 1024x1024 png/jpeg/gif image for the guild icon (can be animated gif when the server has the `ANIMATED_ICON` feature)
 * @param {string} owner_id User id to transfer guild ownership to (must be owner)
 * @param {object} splash Base64 16:9 png/jpeg image for the guild splash (when the server has the `INVITE_SPLASH` feature)
 * @param {object} discovery_splash Base64 16:9 png/jpeg image for the guild discovery splash (when the server has the `DISCOVERABLE` feature)
 * @param {object} banner Base64 16:9 png/jpeg image for the guild banner (when the server has the `BANNER` feature; can be animated gif when the server has the `ANIMATED_BANNER` feature)
 * @param {string} system_channel_id The id of the channel where guild notices such as welcome messages and boost events are posted
 * @param {integer} system_channel_flags [system channel flags](https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags)
 * @param {string} rules_channel_id The id of the channel where Community guilds display rules and/or guidelines
 * @param {string} public_updates_channel_id The id of the channel where admins and moderators of Community guilds receive notices from Discord
 * @param {string} preferred_locale The preferred [locale](https://discord.com/developers/docs/reference#locales) of a Community guild used in server discovery and notices from Discord; defaults to "en-US"
 * @param {array} features Enabled guild features, *  * @ {string} undefined 
 * @param {string} description The description for the guild
 * @param {boolean} premium_progress_bar_enabled Whether the guild's boost progress bar should be enabled
 * @param {string} safety_alerts_channel_id The id of the channel where admins and moderators of Community guilds receive safety alerts from Discord
 * @returns {object}
 */
module.exports = async (guild_id, name, region, verification_level, default_message_notifications, explicit_content_filter, afk_channel_id, afk_timeout, icon, owner_id, splash, discovery_splash, banner, system_channel_id, system_channel_flags, rules_channel_id, public_updates_channel_id, preferred_locale, features, description, premium_progress_bar_enabled, safety_alerts_channel_id) => {

  const supportsMultipart = false;
  const _method = 'PATCH';
  let _pathname = '/guilds/{guild_id}';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (guild_id !== null) { _pathParams['guild_id'] = guild_id; }
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
  if (name !== null) { _bodyParams['name'] = name; }
  if (region !== null) { _bodyParams['region'] = region; }
  if (verification_level !== null) { _bodyParams['verification_level'] = verification_level; }
  if (default_message_notifications !== null) { _bodyParams['default_message_notifications'] = default_message_notifications; }
  if (explicit_content_filter !== null) { _bodyParams['explicit_content_filter'] = explicit_content_filter; }
  if (afk_channel_id !== null) { _bodyParams['afk_channel_id'] = afk_channel_id; }
  if (afk_timeout !== null) { _bodyParams['afk_timeout'] = afk_timeout; }
  if (icon !== null) { _bodyParams['icon'] = icon; }
  if (owner_id !== null) { _bodyParams['owner_id'] = owner_id; }
  if (splash !== null) { _bodyParams['splash'] = splash; }
  if (discovery_splash !== null) { _bodyParams['discovery_splash'] = discovery_splash; }
  if (banner !== null) { _bodyParams['banner'] = banner; }
  if (system_channel_id !== null) { _bodyParams['system_channel_id'] = system_channel_id; }
  if (system_channel_flags !== null) { _bodyParams['system_channel_flags'] = system_channel_flags; }
  if (rules_channel_id !== null) { _bodyParams['rules_channel_id'] = rules_channel_id; }
  if (public_updates_channel_id !== null) { _bodyParams['public_updates_channel_id'] = public_updates_channel_id; }
  if (preferred_locale !== null) { _bodyParams['preferred_locale'] = preferred_locale; }
  if (features !== null) { _bodyParams['features'] = features; }
  if (description !== null) { _bodyParams['description'] = description; }
  if (premium_progress_bar_enabled !== null) { _bodyParams['premium_progress_bar_enabled'] = premium_progress_bar_enabled; }
  if (safety_alerts_channel_id !== null) { _bodyParams['safety_alerts_channel_id'] = safety_alerts_channel_id; }

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
