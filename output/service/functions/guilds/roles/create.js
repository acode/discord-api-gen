const io = require('io');

/**
 * Create Guild Role
 * Create a new [role](https://discord.com/developers/docs/topics/permissions#role-object) for the guild
 * Requires the `MANAGE_ROLES` permission. Returns the new [role](https://discord.com/developers/docs/topics/permissions#role-object) object on success. Fires a [Guild Role Create](https://discord.com/developers/docs/topics/gateway-events#guild-role-create) Gateway event. All JSON params are optional.
 * @param {string} guild_id Guild id
 * @param {string} name Name of the role, max 100 characters
 * @param {string} permissions Bitwise value of the enabled/disabled permissions
 * @param {integer} color RGB color value
 * @param {boolean} hoist Whether the role should be displayed separately in the sidebar
 * @param {object} icon The role's icon image (if the guild has the `ROLE_ICONS` feature)
 * @param {string} unicode_emoji The role's unicode emoji as a [standard emoji](https://discord.com/developers/docs/reference#message-formatting) (if the guild has the `ROLE_ICONS` feature)
 * @param {boolean} mentionable Whether the role should be mentionable
 * @returns {object}
 */
module.exports = async (guild_id, name, permissions, color, hoist, icon, unicode_emoji, mentionable) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/guilds/{guild_id}/roles';

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
  if (permissions !== null) { _bodyParams['permissions'] = permissions; }
  if (color !== null) { _bodyParams['color'] = color; }
  if (hoist !== null) { _bodyParams['hoist'] = hoist; }
  if (icon !== null) { _bodyParams['icon'] = icon; }
  if (unicode_emoji !== null) { _bodyParams['unicode_emoji'] = unicode_emoji; }
  if (mentionable !== null) { _bodyParams['mentionable'] = mentionable; }

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
