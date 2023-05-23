const io = require('io');

/**
 * Get Guild Audit Log
 * Returns an [audit log](https://discord.com/developers/docs/resources/audit-log#audit-log-object) object for the guild
 * Requires the [`VIEW_AUDIT_LOG`](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags) permission.
 * 
 * The returned list of audit log entries is ordered based on whether you use `before` or `after`. When using `before`, the list is ordered by the audit log entry ID **descending** (newer entries first). If `after` is used, the list is reversed and appears in **ascending** order (older entries first). Omitting both `before` and `after` defaults to `before` the current timestamp and will show the most recent entries in descending order by ID, the opposite can be achieved using `after=0` (showing oldest entries).
 * @param {string} guild_id Guild id
 * @param {string} user_id Entries from a specific user ID
 * @param {integer} action_type Entries for a specific [audit log event](https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events)
 * @param {string} before Entries with ID less than a specific audit log entry ID
 * @param {string} after Entries with ID greater than a specific audit log entry ID
 * @param {integer} limit Maximum number of entries (between 1-100) to return, defaults to 50
 * @returns {object}
 */
module.exports = (guild_id, user_id = null, action_type = null, before = null, after = null, limit = null) => {

  const supportsMultipart = false;
  const _method = 'GET';
  let _pathname = '/guilds/{guild_id}/audit-logs';

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
  if (user_id !== null) { _queryParams['user_id'] = user_id; }
  if (action_type !== null) { _queryParams['action_type'] = action_type; }
  if (before !== null) { _queryParams['before'] = before; }
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
