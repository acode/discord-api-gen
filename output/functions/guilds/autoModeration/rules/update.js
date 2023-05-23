const io = require('io');

/**
 * Modify Auto Moderation Rule
 * Modify an existing rule
 * Returns an [auto moderation rule](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object) on success. Fires an [Auto Moderation Rule Update](https://discord.com/developers/docs/topics/gateway-events#auto-moderation-rule-update) Gateway event.
 * @param {string} guild_id Guild id
 * @param {string} auto_moderation_rule_id The id of the rule
 * @param {string} name The rule name
 * @param {integer} event_type The [event type](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-event-types)
 * @param {object} trigger_metadata The [trigger metadata](https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata)
 * @param {array} actions The actions which will execute when the rule is triggered, *  * @ {object} undefined 
 * @param {boolean} enabled Whether the rule is enabled
 * @param {array} exempt_roles The role ids that should not be affected by the rule (Maximum of 20), *  * @ {string} undefined 
 * @param {array} exempt_channels The channel ids that should not be affected by the rule (Maximum of 50), *  * @ {string} undefined 
 * @returns {object}
 */
module.exports = (guild_id, auto_moderation_rule_id, name, event_type, trigger_metadata = null, actions, enabled, exempt_roles, exempt_channels) => {

  const supportsMultipart = false;
  const _method = 'PATCH';
  let _pathname = '/guilds/{guild_id}/auto-moderation/rules/{auto_moderation_rule_id}';

  let _provider = context.providers['discord'] || {};
  let _providerAuth = (_provider.AUTH && _provider.AUTH.OAUTH2) || {};
  if (!_providerAuth.botToken) { throw new Error('No Discord Auth Token Provided'); }
  if (!_providerAuth.clientId) { throw new Error('No Discord Application ID Provided'); }

  const _pathParams = {};
  if (guild_id !== null) { _pathParams['guild_id'] = guild_id; }
  if (auto_moderation_rule_id !== null) { _pathParams['auto_moderation_rule_id'] = auto_moderation_rule_id; }
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
  if (event_type !== null) { _bodyParams['event_type'] = event_type; }
  if (trigger_metadata !== null) { _bodyParams['trigger_metadata'] = trigger_metadata; }
  if (actions !== null) { _bodyParams['actions'] = actions; }
  if (enabled !== null) { _bodyParams['enabled'] = enabled; }
  if (exempt_roles !== null) { _bodyParams['exempt_roles'] = exempt_roles; }
  if (exempt_channels !== null) { _bodyParams['exempt_channels'] = exempt_channels; }

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
