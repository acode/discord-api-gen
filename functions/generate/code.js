const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const OUTPUT_ROOT = './output/discord';
const SCHEMA_PATH = './output/schema.json';
const ENDPOINT_TEMPLATE_PATH = './helpers/discord/templates/endpoint.js';
const TEMPLATE_PATH = './helpers/discord/templates/root';

if (!fs.existsSync(OUTPUT_ROOT)) {
  fs.mkdirSync(OUTPUT_ROOT);
}

const localEnv = {};

if (context.params.DISCORD_BOT_TOKEN) {
  localEnv.DISCORD_BOT_TOKEN = context.params.DISCORD_BOT_TOKEN;
}
if (context.params.DISCORD_CLIENT_ID) {
  localEnv.DISCORD_CLIENT_ID = context.params.DISCORD_CLIENT_ID;
}

if (
  (localEnv.DISCORD_BOT_TOKEN && !localEnv.DISCORD_CLIENT_ID) ||
  (!localEnv.DISCORD_BOT_TOKEN && localEnv.DISCORD_CLIENT_ID)
) {
  throw new Error(`Must provide both "DISCORD_BOT_TOKEN" and "DISCORD_CLIENT_ID" or neither`);
}

let schema;
let template;

try {
  let schemaJSON = fs.readFileSync(SCHEMA_PATH).toString();
  schema = JSON.parse(schemaJSON);
} catch (e) {
  throw new Error(`Could not load schema from "${SCHEMA_PATH}", please generate schema first.`);
}

try {
  template = fs.readFileSync(ENDPOINT_TEMPLATE_PATH).toString();
} catch (e) {
  throw new Error(`Could not load template from "${ENDPOINT_TEMPLATE_PATH}", please make sure a template exists.`);
}

const writeParam = (param, indent = 0) => {
  let description = (param.description || '').split('\n');
  let lines = [`@${indent === 0 ? 'param' : '  '.repeat(indent - 1)} {${param.type}} ${param.name || ''} ${description[0]}`];
  lines = lines.concat(description.slice(1));
  if (param.schema) {
    lines = [].concat.apply(
      lines,
      param.schema.map(param => writeParam(param, indent + 1))
    );
  }
  return lines.filter(line => line.trim()).map(line => {
    return line.startsWith(' * ')
      ? line
      : ` * ${line}`;
  });
};

const namespaces = [];

schema.forEach(endpoint => {

  let allParams = [].concat(
    endpoint.pathParams,
    endpoint.queryParams,
    endpoint.jsonParams
  ).filter(param => param.name !== 'application_id');

  let descriptionLines = [endpoint.title].concat(endpoint.description.split('\n'));

  const inputs = {
    'description': descriptionLines.filter(line => line.trim()).map(line => ` * ${line}`).join('\n'),
    'params': (
      allParams.length
        ? `\n${[].concat.apply([], allParams.map(param => writeParam(param))).join('\n')}`
        : ''
    ),
    'returns': `\n * @returns {${endpoint.returns ? endpoint.returns.type : 'object'}}`,
    'paramsList': [].concat(
      allParams.map(param => `${param.name}${param.optional ? ' = null' : ''}`),
      'context'
    ).join(', '),
    'supportsMultipart': endpoint.supports_multipart.toString(),
    'method': endpoint.method,
    'url': endpoint.url,
    'checkPathParams': endpoint.pathParams
      .filter(param => param.name !== 'application_id')
      .map(param => {
        return `  if (${param.name} !== null) { _pathParams['${param.name}'] = ${param.name}; }`;
      }).join('\n'),
    'checkQueryParams': endpoint.queryParams
      .map(param => {
        return `  if (${param.name} !== null) { _queryParams['${param.name}'] = ${param.name}; }`;
      }).join('\n'),
    'checkBodyParams': endpoint.jsonParams
      .map(param => {
        return `  if (${param.name} !== null) { _bodyParams['${param.name}'] = ${param.name}; }`;
      }).join('\n')
  };

  let fileString = template.replace(/\/?\*\{(.*?)\}\*\/?/gi, ($0, $1) => {
    if (!($1 in inputs)) {
      throw new Error(`Missing required template data: "${$1}" in "${endpoint.name}"`);
    }
    let data = inputs[$1];
    return data;
  });

  fileString = fileString.replace(/\n\n+/gi, '\n\n');
  let namespace = endpoint.name.split('/')[0];
  let name = endpoint.name.split('/').slice(1).join('/');
  let filename = `${namespace}/functions/${name}.js`;
  if (namespaces.indexOf(namespace) === -1) {
    namespaces.push(namespace);
  }

  let fileparts = filename.split('/');
  for (let i = 0; i < fileparts.length - 1; i++) {
    let mkpath = path.join(OUTPUT_ROOT, fileparts.slice(0, i + 1).join('/'));
    if (!fs.existsSync(mkpath)) {
      fs.mkdirSync(mkpath);
    }
  }

  let filepath = path.join(OUTPUT_ROOT, filename);
  console.log(`Writing "${endpoint.name}" (${filepath}) ...`);
  fs.writeFileSync(filepath, fileString);

});

let files = fs.readdirSync(TEMPLATE_PATH);
namespaces.forEach(namespace => {
  files.forEach(filename => {
    let readpath = path.join(TEMPLATE_PATH, filename);
    let file = fs.readFileSync(readpath);
    if (filename === 'stdlib.json') {
      let json = JSON.parse(file.toString());
      json.name = [json.name.split('/')[0], namespace].join('/');
      file = Buffer.from(JSON.stringify(json, null, 2));
    } else if (filename === 'package.json') {
      let json = JSON.parse(file.toString());
      json.name = [json.name.split('-')[0], namespace].join('-');
      file = Buffer.from(JSON.stringify(json, null, 2));
    } else if (filename === 'env.json') {
      let json = JSON.parse(file.toString());
      Object.keys(localEnv).forEach(key => {
        json.local[key] = localEnv[key];
      });
      file = Buffer.from(JSON.stringify(json, null, 2));
    }
    let filepath = path.join(OUTPUT_ROOT, namespace, filename);
    console.log(`Writing "${filename}" (${filepath}) ...`);
    fs.writeFileSync(filepath, file);
  });
});

console.log(`Wrote ${schema.length} endpoints!`);
