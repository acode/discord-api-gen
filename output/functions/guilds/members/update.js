const io = require('io');

/**
 * Modify Guild Member
 * Modify attributes of a [guild member](https://discord.com/developers/docs/resources/guild#guild-member-object)
 * Returns a 200 OK with the [guild member](https://discord.com/developers/docs/resources/guild#guild-member-object) as the body. Fires a [Guild Member Update](https://discord.com/developers/docs/topics/gateway-events#guild-member-update) Gateway event. If the `channel_id` is set to null, this will force the target user to be disconnected from voice.
 * @param {string} guild_id Guild id
 * @param {string} user_id The user's id
 * @param {string} nick Value to set user's nickname to
 * @param {array} roles Array of role ids the member is assigned, *  * @ {string} undefined 
 * @param {boolean} mute Whether the user is muted in voice channels, * Will throw a 400 error if the user is not in a voice channel
 * @param {boolean} deaf Whether the user is deafened in voice channels, * Will throw a 400 error if the user is not in a voice channel
 * @param {string} channel_id Id of channel to move user to (if they are connected to voice)
 * @param {string} communication_disabled_until When the user's [timeout](https://support.discord.com/hc/en-us/articles/4413305239191-Time-Out-FAQ) will expire and the user will be able to communicate in the guild again (up to 28 days in the future), set to null to remove timeout, * Will throw a 403 error if the user has the ADMINISTRATOR permission or is the owner of the guild
 * @returns {object}
 */
module.exports = (guild_id, user_id, nick, roles, mute, deaf, channel_id, communication_disabled_until) => {

  const supportsMultipart = false;
  const _method = 'PATCH';
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
  if (nick !== null) { _bodyParams['nick'] = nick; }
  if (roles !== null) { _bodyParams['roles'] = roles; }
  if (mute !== null) { _bodyParams['mute'] = mute; }
  if (deaf !== null) { _bodyParams['deaf'] = deaf; }
  if (channel_id !== null) { _bodyParams['channel_id'] = channel_id; }
  if (communication_disabled_until !== null) { _bodyParams['communication_disabled_until'] = communication_disabled_until; }

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
