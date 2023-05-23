const io = require('io');

/**
 * Modify Guild Scheduled Event
 * Modify a guild scheduled event
 * Returns the modified [guild scheduled event](https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object) object on success. Fires a [Guild Scheduled Event Update](https://discord.com/developers/docs/topics/gateway-events#guild-scheduled-event-update) Gateway event.
 * @param {string} guild_id Guild id
 * @param {string} guild_scheduled_event_id The id of the scheduled event
 * @param {string} channel_id The channel id of the scheduled event, set to `null` if changing entity type to `EXTERNAL`
 * @param {object} entity_metadata The entity metadata of the scheduled event
 * @param {string} name The name of the scheduled event
 * @param {integer} privacy_level The privacy level of the scheduled event
 * @param {string} scheduled_start_time The time to schedule the scheduled event
 * @param {string} scheduled_end_time The time when the scheduled event is scheduled to end
 * @param {string} description The description of the scheduled event
 * @param {any} entity_type The entity type of the scheduled event
 * @param {any} status The status of the scheduled event
 * @param {object} image The cover image of the scheduled event
 * @returns {object}
 */
module.exports = (guild_id, guild_scheduled_event_id, channel_id = null, entity_metadata = null, name = null, privacy_level = null, scheduled_start_time = null, scheduled_end_time = null, description = null, entity_type = null, status = null, image = null) => {

  const supportsMultipart = false;
  const _method = 'PATCH';
  let _pathname = '/guilds/{guild_id}/scheduled-events/{guild_scheduled_event_id}';

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

  const _bodyParams = {};
  if (channel_id !== null) { _bodyParams['channel_id'] = channel_id; }
  if (entity_metadata !== null) { _bodyParams['entity_metadata'] = entity_metadata; }
  if (name !== null) { _bodyParams['name'] = name; }
  if (privacy_level !== null) { _bodyParams['privacy_level'] = privacy_level; }
  if (scheduled_start_time !== null) { _bodyParams['scheduled_start_time'] = scheduled_start_time; }
  if (scheduled_end_time !== null) { _bodyParams['scheduled_end_time'] = scheduled_end_time; }
  if (description !== null) { _bodyParams['description'] = description; }
  if (entity_type !== null) { _bodyParams['entity_type'] = entity_type; }
  if (status !== null) { _bodyParams['status'] = status; }
  if (image !== null) { _bodyParams['image'] = image; }

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
