const io = require('io');

/**
 * List Thread Members
 * Returns array of [thread members](https://discord.com/developers/docs/resources/channel#thread-member-object) objects that are members of the thread.
 * When `with_member` is set to `true`, the results will be paginated and each thread member object will include a `member` field containing a [guild member](https://discord.com/developers/docs/resources/guild#guild-member-object) object.
 * @param {string} channel_id The id of the channel
 * @param {boolean} with_member Whether to include a [guild member](https://discord.com/developers/docs/resources/guild#guild-member-object) object for each thread member
 * @param {string} after Get thread members after this user ID
 * @param {integer} limit Max number of thread members to return (1-100)
 * Defaults to 100.
 * @returns {object}
 */
module.exports = async (channel_id, with_member = null, after = null, limit = null, context) => {

  const supportsMultipart = false;
  const _method = 'GET';
  let _pathname = '/channels/{channel_id}/thread-members';

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
    return _pathParams[name];
  });

  const _url = `https://${process.env.API_URL}/${_pathname}`;
  const _headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bot ${_providerAuth.botToken}`,
    'Accept': 'application/json'
  };

  const _queryParams = {};
  if (with_member !== null) { _queryParams['with_member'] = with_member; }
  if (after !== null) { _queryParams['after'] = after; }
  if (limit !== null) { _queryParams['limit'] = limit; }

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
