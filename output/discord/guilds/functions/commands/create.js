const io = require('io');

/**
 * Create Guild Application Command
 * Create a new guild command
 * New guild commands will be available in the guild immediately. Returns `201` if a command with the same name does not already exist, or a `200` if it does (in which case the previous command will be overwritten). Both responses include an [application command](https://discord.com/developers/docs/interactions/application-commands#application-command-object) object.
 * @param {string} guild_id Guild id
 * @param {string} name [Name of command](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming), 1-32 characters
 * @param {object} name_localizations Localization dictionary for the `name` field
 * Values follow the same restrictions as `name`
 * @param {string} description 1-100 character description for `CHAT_INPUT` commands
 * @param {object} description_localizations Localization dictionary for the `description` field
 * Values follow the same restrictions as `description`
 * @param {array} options Parameters for the command
 * @ {object}  
 * @param {string} default_member_permissions Set of [permissions](#DOCS_TOPICS_PERMISSIONS) represented as a bit set
 * @param {boolean} default_permission Replaced by `default_member_permissions` and will be deprecated in the future
 * Indicates whether the command is enabled by default when the app is added to a guild. Defaults to `true`
 * @param {any} type Type of command, defaults `1` if not set
 * @param {boolean} nsfw Indicates whether the command is [age-restricted](https://discord.com/developers/docs/interactions/application-commands#agerestricted-commands)
 * @returns {object}
 */
module.exports = async (guild_id, name, name_localizations = null, description = null, description_localizations = null, options = null, default_member_permissions = null, default_permission = null, type = null, nsfw = null, context) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/applications/{application_id}/guilds/{guild_id}/commands';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {
    botToken: process.env.DISCORD_BOT_TOKEN, // for debugging
    clientId: process.env.DISCORD_CLIENT_ID // for debugging
  };
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
  if (name_localizations !== null) { _bodyParams['name_localizations'] = name_localizations; }
  if (description !== null) { _bodyParams['description'] = description; }
  if (description_localizations !== null) { _bodyParams['description_localizations'] = description_localizations; }
  if (options !== null) { _bodyParams['options'] = options; }
  if (default_member_permissions !== null) { _bodyParams['default_member_permissions'] = default_member_permissions; }
  if (default_permission !== null) { _bodyParams['default_permission'] = default_permission; }
  if (type !== null) { _bodyParams['type'] = type; }
  if (nsfw !== null) { _bodyParams['nsfw'] = nsfw; }

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
