const io = require('io');

/**
 * Add Guild Member
 * Adds a user to the guild, provided you have a valid oauth2 access token for the user with the `guilds.join` scope
 * Returns a 201 Created with the [guild member](https://discord.com/developers/docs/resources/guild#guild-member-object) as the body, or 204 No Content if the user is already a member of the guild. Fires a [Guild Member Add](https://discord.com/developers/docs/topics/gateway-events#guild-member-add) Gateway event.
 * 
 * For guilds with [Membership Screening](https://discord.com/developers/docs/resources/guild#membership-screening-object) enabled, this endpoint will default to adding new members as `pending` in the [guild member object](https://discord.com/developers/docs/resources/guild#guild-member-object). Members that are `pending` will have to complete membership screening before they become full members that can talk.
 * @param {string} guild_id Guild id
 * @param {string} user_id The user's id
 * @param {string} access_token An oauth2 access token granted with the `guilds.join` to the bot's application for the user you want to add to the guild
 * @param {string} nick Value to set user's nickname to
 * @param {array} roles Array of role ids the member is assigned, *  * @ {string} undefined 
 * @param {boolean} mute Whether the user is muted in voice channels
 * @param {boolean} deaf Whether the user is deafened in voice channels
 * @returns {object}
 */
module.exports = async (guild_id, user_id, access_token, nick, roles, mute, deaf) => {

  const supportsMultipart = false;
  const _method = 'PUT';
  let _pathname = '/guilds/{guild_id}/members/{user_id}';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (guild_id !== null) { _pathParams['guild_id'] = guild_id; }
  if (user_id !== null) { _pathParams['user_id'] = user_id; }
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
  if (access_token !== null) { _bodyParams['access_token'] = access_token; }
  if (nick !== null) { _bodyParams['nick'] = nick; }
  if (roles !== null) { _bodyParams['roles'] = roles; }
  if (mute !== null) { _bodyParams['mute'] = mute; }
  if (deaf !== null) { _bodyParams['deaf'] = deaf; }

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
