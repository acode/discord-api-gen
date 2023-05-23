const io = require('io');

/**
 * Create Guild Channel
 * Create a new [channel](https://discord.com/developers/docs/resources/channel#channel-object) object for the guild
 * Requires the `MANAGE_CHANNELS` permission. If setting permission overwrites, only permissions your bot has in the guild can be allowed/denied. Setting `MANAGE_ROLES` permission in channels is only possible for guild administrators. Returns the new [channel](https://discord.com/developers/docs/resources/channel#channel-object) object on success. Fires a [Channel Create](https://discord.com/developers/docs/topics/gateway-events#channel-create) Gateway event.
 * @param {string} guild_id Guild id
 * @param {string} name Channel name (1-100 characters)
 * @param {integer} type The [type of channel](https://discord.com/developers/docs/resources/channel#channel-object-channel-types)
 * @param {string} topic Channel topic (0-1024 characters)
 * @param {integer} bitrate The bitrate (in bits) of the voice or stage channel; min 8000
 * @param {integer} user_limit The user limit of the voice channel
 * @param {integer} rate_limit_per_user Amount of seconds a user has to wait before sending another message (0-21600); bots, as well as users with the permission `manage_messages` or `manage_channel`, are unaffected
 * @param {integer} position Sorting position of the channel
 * @param {array} permission_overwrites The channel's permission overwrites, *  * @ {object} undefined 
 * @param {string} parent_id Id of the parent category for a channel
 * @param {boolean} nsfw Whether the channel is nsfw
 * @param {string} rtc_region Channel [voice region](#https://discord.com/developers/docs/resources/voicevoice-region-object) id of the voice or stage channel, automatic when set to null
 * @param {integer} video_quality_mode The camera [video quality mode](https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes) of the voice channel
 * @param {integer} default_auto_archive_duration The default duration that the clients use (not the API) for newly created threads in the channel, in minutes, to automatically archive the thread after recent activity
 * @param {object} default_reaction_emoji Emoji to show in the add reaction button on a thread in a `GUILD_FORUM` channel
 * @param {array} available_tags Set of tags that can be used in a `GUILD_FORUM` channel, *  * @ {object} undefined 
 * @param {integer} default_sort_order The [default sort order type](https://discord.com/developers/docs/resources/channel#channel-object-sort-order-types) used to order posts in `GUILD_FORUM` channels
 * @returns {object}
 */
module.exports = (guild_id, name, type, topic, bitrate, user_limit, rate_limit_per_user, position, permission_overwrites, parent_id, nsfw, rtc_region, video_quality_mode, default_auto_archive_duration, default_reaction_emoji, available_tags, default_sort_order) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/guilds/{guild_id}/channels';

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
  if (type !== null) { _bodyParams['type'] = type; }
  if (topic !== null) { _bodyParams['topic'] = topic; }
  if (bitrate !== null) { _bodyParams['bitrate'] = bitrate; }
  if (user_limit !== null) { _bodyParams['user_limit'] = user_limit; }
  if (rate_limit_per_user !== null) { _bodyParams['rate_limit_per_user'] = rate_limit_per_user; }
  if (position !== null) { _bodyParams['position'] = position; }
  if (permission_overwrites !== null) { _bodyParams['permission_overwrites'] = permission_overwrites; }
  if (parent_id !== null) { _bodyParams['parent_id'] = parent_id; }
  if (nsfw !== null) { _bodyParams['nsfw'] = nsfw; }
  if (rtc_region !== null) { _bodyParams['rtc_region'] = rtc_region; }
  if (video_quality_mode !== null) { _bodyParams['video_quality_mode'] = video_quality_mode; }
  if (default_auto_archive_duration !== null) { _bodyParams['default_auto_archive_duration'] = default_auto_archive_duration; }
  if (default_reaction_emoji !== null) { _bodyParams['default_reaction_emoji'] = default_reaction_emoji; }
  if (available_tags !== null) { _bodyParams['available_tags'] = available_tags; }
  if (default_sort_order !== null) { _bodyParams['default_sort_order'] = default_sort_order; }

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
