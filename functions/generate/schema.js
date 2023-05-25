const fs = require('fs');

const readDocs = require('../../helpers/discord/read_docs.js');
const formatEndpoints = require('../../helpers/discord/format_endpoints.js');

const VALID_TYPES = {
  'string': true,
  'integer': true,
  'float': true,
  'object': true,
  'array': true,
  'boolean': true,
  'any': true
};

const DOCS_PAGES = {
  'commands': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/interactions/Application_Commands.md',
  'message_components': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/interactions/Message_Components.md',
  'interactions': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/interactions/Receiving_and_Responding.md',
  'applications': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Application.md',
  'application_role_connection_metadata': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Application_Role_Connection_Metadata.md',
  'audit_logs': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Audit_Log.md',
  'auto_moderation': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Auto_Moderation.md',
  'channels': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Channel.md',
  'emojis': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Emoji.md',
  'guilds': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Guild.md',
  'guild_scheduled_events': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Guild_Scheduled_Event.md',
  'guild_templates': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Guild_Template.md',
  'invites': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Invite.md',
  'stage_instances': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Stage_Instance.md',
  'stickers': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Sticker.md',
  'users': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/User.md',
  'voice': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Voice.md',
  'webhooks': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/resources/Webhook.md',
  'permissions': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/topics/Permissions.md',
  'teams': 'https://raw.githubusercontent.com/discord/discord-api-docs/main/docs/topics/Teams.md',
};

let namespaces = Object.keys(DOCS_PAGES);
let objects = {};
let reference = {};
for (let i = 0; i < namespaces.length; i++) {
  let namespace = namespaces[i];
  console.log(`Reading docs for namespace "${namespace}", getObjects (${i + 1} of ${namespaces.length}) ...`);
  let result = await readDocs.getObjects(DOCS_PAGES[namespace], objects, reference);
  reference = result.reference;
  objects = result.objects;
}

let missingObjects = Object.keys(reference.objects).filter(name => {
  return !(name in objects);
}).sort();

let unreferencedObjects = Object.keys(objects).filter(name => {
  return !(name in reference.objects);
}).sort();

let referencedObjects = Object.keys(objects).filter(name => {
  return (name in reference.objects);
}).sort();

if (missingObjects.length) {
  throw new Error(
    `Found ${missingObjects.length} referenced but missing definitions:` +
    `\n${missingObjects.join(', ')}`
  );
}

let objectTypes = Object.keys(reference.types);
let missingObjectTypes = objectTypes.filter(type => !(type in VALID_TYPES));
if (missingObjectTypes.length) {
  throw new Error(
    `Found ${missingObjectTypes.length} referenced but missing types while getting object definitions:` +
    `\n${missingObjectTypes.join(', ')}`
  );
}

// Reset type reference...
reference.types = {};
let endpoints = [];

for (let i = 0; i < namespaces.length; i++) {
  let namespace = namespaces[i];
  console.log(`Reading docs for namespace "${namespace}", getEndpoints (${i + 1} of ${namespaces.length}) ...`);
  let result = await readDocs.getEndpoints(namespace, DOCS_PAGES[namespace], objects, reference);
  reference = result.reference;
  endpoints = endpoints.concat(result.endpoints);
}

let missingEndpointObjects = Object.keys(reference.objects).filter(name => {
  return !(name in objects);
}).sort();

if (missingEndpointObjects.length) {
  console.error(
    `Found ${missingEndpointObjects.length} referenced but missing definitions:` +
    `\n${missingEndpointObjects.join(', ')}`
  );
}

let missingDocs = Object.keys(reference.missing_docs);

if (missingDocs.length) {
  throw new Error(
    `Found ${missingDocs.length} referenced but missing docs references:` +
    `\n${missingDocs.join('\n')}`
  );
}

let endpointTypes = Object.keys(reference.types);
let missingEndpointTypes = endpointTypes.filter(type => !(type in VALID_TYPES));
if (missingEndpointTypes.length) {
  throw new Error(
    `Found ${missingEndpointTypes.length} referenced but missing types while getting endpoint definitions:` +
    `\n${missingEndpointTypes.join(', ')}`
  );
}

let formattedEndpoints = await formatEndpoints(endpoints);

fs.writeFileSync('./output/schema.json', JSON.stringify(formattedEndpoints, null, 2));

return formattedEndpoints;
