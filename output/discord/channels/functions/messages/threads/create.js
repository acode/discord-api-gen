const io = require('io');

/**
 * Start Thread from Message
 * Creates a new thread from an existing message
 * Returns a [channel](https://discord.com/developers/docs/resources/channel#channel-object) on success, and a 400 BAD REQUEST on invalid parameters. Fires a [Thread Create](https://discord.com/developers/docs/topics/gateway-events#thread-create) and a [Message Update](https://discord.com/developers/docs/topics/gateway-events#message-update) Gateway event.
 * When called on a `GUILD_TEXT` channel, creates a `PUBLIC_THREAD`. When called on a `GUILD_ANNOUNCEMENT` channel, creates a `ANNOUNCEMENT_THREAD`. Does not work on a [`GUILD_FORUM`](https://discord.com/developers/docs/resources/channel#start-thread-in-forum-channel) channel. The id of the created thread will be the same as the id of the source message, and as such a message can only have a single thread created from it.
 * @param {string} channel_id The id of the channel
 * @param {string} message_id Id of the message
 * @param {string} name 1-100 character channel name
 * @param {integer} auto_archive_duration The thread will stop showing in the channel list after `auto_archive_duration` minutes of inactivity, can be set to: 60, 1440, 4320, 10080
 * @param {integer} rate_limit_per_user Amount of seconds a user has to wait before sending another message (0-21600)
 * @returns {object}
 */
module.exports = async (channel_id, message_id, name, auto_archive_duration = null, rate_limit_per_user = null, context) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/channels/{channel_id}/messages/{message_id}/threads';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (channel_id !== null) { _pathParams['channel_id'] = channel_id; }
  if (message_id !== null) { _pathParams['message_id'] = message_id; }
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
  if (auto_archive_duration !== null) { _bodyParams['auto_archive_duration'] = auto_archive_duration; }
  if (rate_limit_per_user !== null) { _bodyParams['rate_limit_per_user'] = rate_limit_per_user; }

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
