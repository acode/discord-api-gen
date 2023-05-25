const io = require('io');

/**
 * Create Stage Instance
 * Creates a new Stage instance associated to a Stage channel
 * Returns that [Stage instance](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-stage-instance-structure). Fires a [Stage Instance Create](https://discord.com/developers/docs/topics/gateway-events#stage-instance-create) Gateway event.
 * 
 * Requires the user to be a moderator of the Stage channel.
 * @param {string} channel_id The id of the Stage channel
 * @param {string} topic The topic of the Stage instance (1-120 characters)
 * @param {integer} privacy_level The [privacy level](https://discord.com/developers/docs/resources/stage-instance#stage-instance-object-privacy-level) of the Stage instance (default GUILD_ONLY)
 * @param {boolean} send_start_notification Notify @everyone that a Stage instance has started
 * @returns {object}
 */
module.exports = async (channel_id, topic, privacy_level = null, send_start_notification = null) => {

  const supportsMultipart = false;
  const _method = 'POST';
  let _pathname = '/stage-instances';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};

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
  if (topic !== null) { _bodyParams['topic'] = topic; }
  if (privacy_level !== null) { _bodyParams['privacy_level'] = privacy_level; }
  if (send_start_notification !== null) { _bodyParams['send_start_notification'] = send_start_notification; }

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
