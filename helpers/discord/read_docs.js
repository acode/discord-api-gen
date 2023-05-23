const io = require('io');

const DEPRECATED_ENDPOINTS = {
  '/applications/{application.id}/guilds/{guild.id}/commands/permissions': true
};

const OBJECT_MAPPINGS = {
  'message_component': 'component',
  'message_sticker_item': 'sticker_item',
  'account': 'integration_account',
  'action': 'auto_moderation_action',
  'member': 'guild_member',
  'tag': 'forum_tag',
  'command': 'application_command',
  'template': 'guild_template',
  'thread-specific_channel': 'channel',
  'entity_metadata': 'guild_scheduled_event_entity_metadata'
};

const DOCS_REFERENCES = {
  '#DOCS_RESOURCES_CHANNEL/': 'https://discord.com/developers/docs/resources/channel#',
  '#DOCS_INTERACTIONS_APPLICATION_COMMANDS/': 'https://discord.com/developers/docs/interactions/application-commands#',
  '#DOCS_INTERACTIONS_MESSAGE_COMPONENTS/': 'https://discord.com/developers/docs/interactions/message-components#',
  '#DOCS_REFERENCE/': 'https://discord.com/developers/docs/reference#',
  '#DOCS_RESOURCES_GUILD/': 'https://discord.com/developers/docs/resources/guild#',
  '#DOCS_GAME_SDK_APPLICATIONS/': 'https://discord.com/developers/docs/game-sdk/applications#',
  '#DOCS_RESOURCES_APPLICATION/': 'https://discord.com/developers/docs/resources/application#',
  '#DOCS_TOPICS_OAUTH2/': 'https://discord.com/developers/docs/topics/oauth2#',
  '#DOCS_RESOURCES_AUDIT_LOG/': 'https://discord.com/developers/docs/resources/audit-log#',
  '#DOCS_RESOURCES_AUTO_MODERATION/': 'https://discord.com/developers/docs/resources/auto-moderation#',
  '#DOCS_RESOURCES_VOICE/': '#https://discord.com/developers/docs/resources/voice',
  '#DOCS_INTERACTIONS_RECEIVING_AND_RESPONDING/': 'https://discord.com/developers/docs/interactions/receiving-and-responding#',
  '#DOCS_RICH_PRESENCE_HOW_TO/': 'https://discord.com/developers/docs/rich-presence/how-to#',
  '#DOCS_RESOURCES_STICKER/': 'https://discord.com/developers/docs/resources/sticker#',
  '#DOCS_RESOURCES_USER/': 'https://discord.com/developers/docs/resources/user#',
  '#DOCS_RESOURCES_INVITE/': 'https://discord.com/developers/docs/resources/invite#',
  '#DOCS_TOPICS_PERMISSIONS/': 'https://discord.com/developers/docs/topics/permissions#',
  '#DOCS_RESOURCES_GUILD_SCHEDULED_EVENT/': 'https://discord.com/developers/docs/resources/guild-scheduled-event#',
  '#DOCS_RESOURCES_STAGE_INSTANCE/': 'https://discord.com/developers/docs/resources/stage-instance#',
  '#DOCS_RESOURCES_APPLICATION_ROLE_CONNECTION_METADATA/': 'https://discord.com/developers/docs/resources/application-role-connection-metadata#',
  '#DOCS_RESOURCES_WEBHOOK/': 'https://discord.com/developers/docs/resources/webhook#',
  '#DOCS_TOPICS_TEAMS/': 'https://discord.com/developers/docs/topics/teams#',
  '#DOCS_TOPICS_GATEWAY_EVENTS/': 'https://discord.com/developers/docs/topics/gateway-events#',
  '#DOCS_RESOURCES_EMOJI/': 'https://discord.com/developers/docs/resources/emoji#',
  '#DOCS_RESOURCES_GUILD_TEMPLATE/': 'https://discord.com/developers/docs/resources/guild-template#'
};

const isPlural = (word) => {
  return word.endsWith('s') && !word.endsWith('us');
}

const readDescription = (description, reference) => {
  if (description) {
    description = description.replace(/#(.+?)\//gi, ($0) => {
      let key = $0;
      if (DOCS_REFERENCES[key]) {
        return DOCS_REFERENCES[key];
      } else {
        reference.missing_docs[key] = true;
        return key;
      }
    });
    description = description.replace(/^(.+?)\. /gi, '$1\n').trim();
    description = description[0].toUpperCase() + description.slice(1);
  }
  return description || '';
};

const readType = (param, reference) => {
  if (param.type.match(/^(array|list) of /gi)) {
    let arrayType = param.type.replace(/^(array|list) of /, '');
    arrayType = arrayType.replace(/ [^a-z]*$/, ''); // Remove asterisks, etc
    if (isPlural(arrayType)) {
      arrayType = arrayType.slice(0, -1);
    }
    param.type = 'array';
    param.schema = [typeConverter({type: arrayType}, reference)];
  } else {
    typeConverter(param, reference);
  }
  return param;
};

const typeConverter = (param, reference) => {
  let originalType = param.type; // For debugging reference
  let type = originalType;
  type = type.replace(/^an? /, '');
  type = type.replace(/\[(.*?)\]\(.*?\)/gi, '$1');
  type = type.replace(/[^a-z]+$/gi, '');
  type = type.trim();
  if (type.startsWith('dictionary ')) {
    type = 'dict';
  } else if (type.match(/integer for .*?double for /gi)) {
    type = 'float';
  } else if (type.match(/string.*?integer/gi)) {
    type = 'any';
  } else if (type.startsWith('string;') || type.startsWith('string (')) {
    type = 'string';
  } else if (type === 'message component') {
    type = 'component';
  } else if (type === 'interaction data') {
    type = 'object';
  }
  let lookup = {
    'null': 'boolean',
    'int': 'integer',
    'integer or string': 'string',
    'snowflake': 'string',
    'ISO8601 timestamp': 'string',
    'dict': 'object',
    'any': 'any',
    'number': 'float',
    'float': 'float',
    'integer': 'integer',
    'string': 'string',
    'object': 'object',
    'array': 'array',
    'boolean': 'boolean'
  };
  if (lookup[type]) {
    param.type = lookup[type];
  } else if (type === 'file contents') {
    param.type = 'array';
    param.optional = true;
    param.isNullable = false;
    param.schema = [
      {
        name: 'attachment',
        type: 'object',
        schema: [
          {
            name: 'filename',
            type: 'string'
          },
          {
            name: 'description',
            type: 'string'
          },
          {
            name: 'file',
            type: 'buffer'
          }
        ]
      }
    ];
  } else {
    if (type === 'ApplicationRoleConnectionMetadataType') {
      type = 'application role connection metadata type';
    } else if (type === 'user') {
      type = 'user object';
    } else if (type === 'event status') {
      type = 'guild scheduled event status type';
    } else if (type === 'integration expire behavior') {
      type = 'integration expire behavior type';
    }
    let matchType = 'object';
    type.replace(/\s*(object|type)s?$/, ($0, $1) => {
      matchType = $1 || 'object';
    });
    let objName = type.replace(/\s*(object|type)s?$/, '')
      .replace(/ /gi, '_')
      .trim();
    if (isPlural(objName)) {
      objName = objName.slice(0, -1);
    }
    if (
      objName.startsWith('Map_of_') ||
      (!objName && matchType === 'object')
    ) {
      param.type = 'object';
    } else if (matchType === 'object') {
      param.type = 'object';
      let partial = objName.startsWith('partial_');
      if (partial) {
        objName = objName.split('_').slice(1).join('_');
        param.partial_object_reference = objName;
      } else {
        param.object_reference = objName;
      }
      objName = OBJECT_MAPPINGS[objName] || objName;
      if (objName === 'component') {
        param.name = 'action_row';
        param.type = 'object';
      } else if (objName === 'select_option_value') {
        param.type = 'string';
        delete param.object_reference;
        delete param.partial_object_reference;
      } else if (objName === 'role_object_id') {
        param.type = 'string';
        delete param.object_reference;
        delete param.partial_object_reference;
      } else if (objName === 'OAuth2_scope') {
        param.type = 'string';
        objName = 'oauth2_scope';
        param.enum_reference = objName;
        reference.enums[objName] = true;
        delete param.object_reference;
        delete param.partial_object_reference;
      } else if (objName === 'audit_log_event') {
        param.type = 'any';
        objName = 'audit_log_event';
        param.enum_reference = objName;
        reference.enums[objName] = true;
        delete param.object_reference;
        delete param.partial_object_reference;
      } else if (objName === 'guild_feature_string') {
        param.type = 'string';
        objName = 'guild_feature';
        param.enum_reference = objName;
        reference.enums[objName] = true;
        delete param.object_reference;
        delete param.partial_object_reference;
      } else if (objName === 'privacy_level') {
        param.type = 'integer';
        objName = 'guild_scheduled_event_privacy_level';
        param.enum_reference = objName;
        reference.enums[objName] = true;
        delete param.object_reference;
        delete param.partial_object_reference;
      } else {
        reference.objects[objName] = true;
      }
    } else if (matchType === 'type') {
      param.type = 'any';
      param.enum_reference = objName;
      reference.enums[objName] = true;
    }
  }
  return param;
};

const readStructure = (table, reference) => {
  if (!table) {
    return [];
  }
  let rows = table.split('\n');
  const formatRow = row => {
    return row.replace(/\s*\|\s*/gi, '|')
      .split('|')
      .filter(v => !!v);
  };
  let headers = formatRow(rows.shift()).map(name => name.toLowerCase());
  rows.shift();
  let params = rows
    .filter(row => !!row)
    .map(row => {
      let values = formatRow(row);
      let param = {};
      param.name = '';
      headers.forEach((header, i) => {
        param[header] = values[i];
      });
      param.name = param.field;
      param.name = param.name.replace(/\s*[^a-z\?_\]]*$/gi, '');
      // param.name = param.name.replace(/\[(.*?)\]\(.*?\)/gi, '$1');
      param.description = readDescription(param.description, reference);
      delete param.field;
      if (param.name.endsWith('?')) {
        param.name = param.name.slice(0, -1);
        param.optional = true;
      } else {
        param.optional = false;
      }
      if (param.required) {
        if (param.required === 'false') {
          param.optional = true;
          delete param.required;
        } else if (param.required === 'true') {
          param.optional = false;
          delete param.required;
        } else if (
          param.required.startsWith('one of ') ||
          param.required === '`multipart/form-data` only'
        ) {
          param.optional = true;
          delete param.required;
        } else {
          console.log(param.required);
          throw new Error('Found required with no edge case handler');
        }
      }
      if (param.type.startsWith('?')) {
        param.type = param.type.slice(1);
        param.isNullable = true;
      } else if (param.type.endsWith('?')) {
        param.type = param.type.slice(0, -1);
        param.isNullable = true;
      } else {
        param.isNullable = false;
      }
      param.name = param.name.replace(/\[n\]$/, '');
      // Force type
      readType(param, reference);
      reference.types[param.type] = true;
      if (param.schema) {
        reference.types[param.schema[0].type] = true;
      }
      return param;
    });
  return params;
};

module.exports = {

  getObjects: async (url, objects = {}, reference = {}) => {

    console.log('Requesting API docs...');

    reference.objects = reference.objects || {};
    reference.enums = reference.enums || {};
    reference.types = reference.types || {};
    reference.missing_docs = reference.missing_docs || {};

    const docsRequest = await io.request('GET', url);
    if (docsRequest.statusCode !== 200) {
      throw new Error(`Received status: ${docsRequest.statusCode}`);
    }
    const docs = docsRequest.body.toString();

    const ObjectsRE = /###### (.*?)(Structure|Object|Metadata|Info)\n\n(?:###### Messages\n\n)?(?:(?:[^\#``|].*?\n)*\n)*((?:\|.*\|\n)+)/gim;

    console.log('Reading Objects...');

    docs.replace(ObjectsRE, ($0, $1, $2, $3) => {
      let name = $1;
      if ($2 === 'Metadata' || $2 === 'Info') {
        name = name + $2;
      }
      name = name.trim().toLowerCase();
      name = name.replace(/ /gi, '_');
      if (!name.startsWith('example_')) {
        if (isPlural(name)) {
          name = name.slice(0, -1);
        }
        if (name.endsWith('_object')) {
          name = name.split('_').slice(0, -1).join('_');
        }
        name = OBJECT_MAPPINGS[name] || name;
        let paramsTable = $3;
        console.log('Loading Object ::', name);
        objects[name] = readStructure(paramsTable, reference);
      }
      return '';
    });

    return {
      reference,
      objects
    };

  },

  getEndpoints: async (namespace, url, objects, reference = {}) => {

    console.log('Requesting API docs...');

    let endpoints = [];
    reference.objects = reference.objects || {};
    reference.enums = reference.enums || {};
    reference.types = reference.types || {};
    reference.missing_docs = reference.missing_docs || {};

    const docsRequest = await io.request('GET', url);
    if (docsRequest.statusCode !== 200) {
      throw new Error(`Received status: ${docsRequest.statusCode}`);
    }
    const docs = docsRequest.body.toString();

    let expectedCount = 0;
    docs.replace(/# (.*?) % (.*)\n/gi, $0 => {
      expectedCount++;
    });

    const EndpointsRE = /# (.*?) % (.*)\n\n(?:>.*\n>.*\n\n)*((?:(?:[^#].*(?:\n\w.*)?)\n\n)*)(?:\-.*\n\n?)*(?:>.*\n>.*\n\n)*(?:###### Limitations\n\n(?:(?:\s*\-.*\n)+)\n)?(?:###### Query String Params\n\n(?:[^\|].*\n\n)*((?:\|.*\|\n)+))?\n?(?:###### JSON(?:\/Form)? Params\n\n(?:[^\|].*\n\n?)*((?:\|.*\|\n)+))?/gim;

    console.log(`Reading Endpoints (Expecting ${expectedCount})...`);

    docs.replace(EndpointsRE, ($0, $1, $2, $3, $4, $5) => {
      let title = $1.trim();
      let urlData = $2.trim().split(' ');
      let method = urlData[0];
      let url = urlData[1];
      let description = readDescription($3, reference).trim();
      let queryTable = $4 || '';
      let jsonTable = $5 || '';
      let pathParams = [];
      url = url.replace(/\{(.*?)#(.*?)\}/gi, ($0, $1) => {
        let name = $1;
        let objName = name.split('.')[0];
        let objProp = name.split('.').slice(1).join('.');
        name = name.replace(/\./gi, '_');
        let param = {
          name: name,
          description: ``,
          type: 'string',
          optional: false,
          isNullable: false
        };
        objName = OBJECT_MAPPINGS[objName] || objName;
        if (objects[objName]) {
          let objParams = objects[objName];
          objProp = objProp || 'id';
          if (objProp) {
            let foundParam = objParams.find(param => param.name === objProp);
            param.description = foundParam.description.replace(/(^| )(this)( |$)/gi, '$1the$3');
            param.type = foundParam.type;
          } else {
            console.error(`Could not match object property:`, objName);
          }
        } else {
          console.error(`Could not match object:`, objName);
        }
        pathParams.push(param);
        return `{${name}}`;
      });
      endpoints.push({
        namespace: namespace,
        name: '',
        title,
        method,
        url,
        description,
        pathParams: pathParams,
        queryParams: readStructure(queryTable, reference),
        jsonParams: readStructure(jsonTable, reference)
      });
    });

    let len = Object.keys(endpoints).length;
    console.log(`Found ${len} endpoints`);

    if (len !== expectedCount) {
      throw new Error(`Mismatch: expected ${expectedCount}!`);
    }

    return {
      reference,
      endpoints
    };

  }

};
