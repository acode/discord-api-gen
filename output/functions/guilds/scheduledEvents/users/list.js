const io = require('io');

/**
 * Get Guild Scheduled Event Users
 * Get a list of guild scheduled event users subscribed to a guild scheduled event
 * Returns a list of [guild scheduled event user](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-user-object) objects on success. Guild member data, if it exists, is included if the `with_member` query parameter is set.
 * @param {string} guild_id Guild id
 * @param {string} guild_scheduled_event_id The id of the scheduled event
 * @param {float} limit Number of users to return (up to maximum 100)
 * @param {boolean} with_member Include guild member data if it exists
 * @param {string} before Consider only users before given user id
 * @param {string} after Consider only users after given user id
 * @returns {object}
 */
module.exports = (guild_id, guild_scheduled_event_id, limit = null, with_member = null, before = null, after = null) => {

  const supportsMultipart = false;
  const _method = 'GET';
  let _pathname = '/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}/users';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (guild_id !== null) { _pathParams['guild_id'] = guild_id; }
  if (guild_scheduled_event_id !== null) { _pathParams['guild_scheduled_event_id'] = guild_scheduled_event_id; }
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
  if (limit !== null) { _queryParams['limit'] = limit; }
  if (with_member !== null) { _queryParams['with_member'] = with_member; }
  if (before !== null) { _queryParams['before'] = before; }
  if (after !== null) { _queryParams['after'] = after; }

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
