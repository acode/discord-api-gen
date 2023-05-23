const fs = require('fs');
const writeCode = require('../../helpers/discord/write_code.js');

let schema;

try {
  let schemaJSON = fs.readFileSync('./output/schema.json').toString();
  schema = JSON.parse(schemaJSON);
} catch (e) {
  throw new Error(`Could not load schema from ./output/schema.json, please generate schema first.`);
}

return schema;
