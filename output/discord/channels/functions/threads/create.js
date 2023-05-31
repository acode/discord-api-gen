const io = require('io');

/**
 * Start Thread in Forum Channel
 * Creates a new thread in a forum channel, and sends a message within the created thread
 * Returns a [channel](https://discord.com/developers/docs/resources/channel#channel-object), with a nested [message](https://discord.com/developers/docs/resources/channel#message-object) object, on success, and a 400 BAD REQUEST on invalid parameters. Fires a [Thread Create](https://discord.com/developers/docs/topics/gateway-events#thread-create) and [Message Create](https://discord.com/developers/docs/topics/gateway-events#message-create) Gateway event.
 * @param {string} channel_id The id of the channel
 * @param {string} name 1-100 character channel name
 * @param {integer} auto_archive_duration Duration in minutes to automatically archive the thread after recent activity, can be set to: 60, 1440, 4320, 10080
 * @param {integer} rate_limit_per_user Amount of seconds a user has to wait before sending another message (0-21600)
 * @param {object} message Contents of the first message in the forum thread
 * @param {array} applied_tags The IDs of the set of tags that have been applied to a thread in a `GUILD_FORUM` channel
 * @ {string}  
 * @returns {object}
 */
module.exports = async (channel_id, name, auto_archive_duration = null, rate_limit_per_user = null, message, applied_tags = null, context) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/channels/{channel_id}/threads';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (channel_id !== null) { _pathParams['channel_id'] = channel_id; }
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
  if (message !== null) { _bodyParams['message'] = message; }
  if (applied_tags !== null) { _bodyParams['applied_tags'] = applied_tags; }

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
