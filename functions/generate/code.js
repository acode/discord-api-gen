const fs = require('fs');
const path = require('path');

const writeCode = require('../../helpers/discord/write_code.js');

const OUTPUT_ROOT = './output/functions';
const SCHEMA_PATH = './output/schema.json';
const ENDPOINT_TEMPLATE_PATH = './helpers/discord/templates/endpoint.js';

if (!fs.existsSync(OUTPUT_ROOT)) {
  fs.mkdirSync(OUTPUT_ROOT);
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
  let lines = [`@${indent === 0 ? 'param' : '  '.repeat(indent - 1)} {${param.type}} ${param.name} ${description[0]}`];
  lines = lines.concat(description.slice(1));
  if (param.schema) {
    lines = lines.concat(param.schema.map(param => writeParam(param, indent + 1)))
  }
  return lines.map(line => ` * ${line}`);
};

schema.forEach(endpoint => {

  let allParams = [].concat(
    endpoint.pathParams,
    endpoint.queryParams,
    endpoint.jsonParams
  ).filter(param => param.name !== 'application_id');

  let descriptionLines = [endpoint.title].concat(endpoint.description.split('\n'));

  const inputs = {
    'description': descriptionLines.map(line => ` * ${line}`).join('\n'),
    'params': (
      allParams.length
        ? `\n${allParams.map(param => writeParam(param)).join('\n')}`
        : ''
    ),
    'returns': '\n * @returns {object}',
    'paramsList': allParams.map(param => `${param.name}${param.optional ? ' = null' : ''}`).join(', '),
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

  let filename = `${endpoint.name}.js`;

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
