const customActionsByTitle = {
  'Start Thread without Message': 'empty/create',
  'Create Group DM': 'group/create',
  'Create Guild from Guild Template': 'createFrom',
  'Modify Guild Role Positions': 'positions/update'
};

function getProperEndpointName (namespace, title, method, path) {
  method = method.toUpperCase();
  if (namespace === 'interactions') {
    path = path.replace(/^\/webhooks\//gi, '/interactions/');
  }
  let entries = path.split('/');
  let endEntry = entries[entries.length - 1];
  let action = '';
  console.log(`Creating name for ${title}...`);
  if (customActionsByTitle[title]) {
    action = customActionsByTitle[title];
  } else if (title.startsWith('Search ')) {
    action = '';
  } else if (title.startsWith('Execute ')) {
    action = 'execute';
  } else if (title.startsWith('Bulk Overwrite ')) {
    action = 'bulkOverwrite';
  } else if (title.startsWith('Batch Edit ')) {
    action = 'batchEdit';
  } else if (title.startsWith('Delete All ')) {
    if (path.endsWith('}')) {
      action = path.replace(/^.*\{(.*?)\}$/gi, '$1/destroy');
    } else {
      action = 'destroy/all';
    }
  } else if (method === 'GET') {
    if (
      path.endsWith('}') ||
      path.endsWith('}/permissions') ||
      endEntry.includes('.') ||
      (
        !endEntry.endsWith('s') &&
        !['public', 'private'].includes(endEntry)
      )
    ) {
      action = 'retrieve';
    } else {
      action = 'list';
    }
  } else if (method === 'POST') {
    action = 'create';
  } else if (method === 'PUT' || method === 'PATCH') {
    if (title.startsWith('Add ')) {
      action = 'create';
    } else if (title.startsWith('Sync ')) {
      action = 'sync';
    } else {
      action = 'update';
    }
  } else if (method === 'DELETE') {
    action = 'destroy';
  } else {
    action = '';
  }
  if (title.endsWith(' with Token')) {
    action = 'token/' + action;
  }
  let name = path
    .replace(/\/{[^\/]*}/gi, '/') // get rid of vars
    .replace(/@/gi, '')
    .replace(/([^\/])-([^\/])/gi, (match, $1, $2) => {
      return $1 + $2.slice(0, 1).toUpperCase() + $2.slice(1);
    })
    .replace(/\.json$/gi, '/data')
    .replace(/\.png$/gi, '/image')
    .split('/')
    .slice(1)
    .concat(action).join('/')
    .replace(/\/+/gi, '/') // get rid of double slashes

  if (name.startsWith('applications/')) {
    name = name.split('/').slice(1).join('/');
  }

  return name;
}

module.exports = async (endpoints) => {

  let names = [];

  return endpoints
    .map(endpoint => {

      let name = getProperEndpointName(
        endpoint.namespace,
        endpoint.title,
        endpoint.method,
        endpoint.url
      );
      if (names[name]) {
        throw new Error(
          `Endpoint naming conflict for "${endpoint.url}" (${name})\n` +
          `Previously "${names[name]}" was also assigned this name.`
        );
      }
      names[name] = endpoint.url;
      endpoint.name = name;

      endpoint.supports_multipart = !!endpoint.jsonParams.find(param => param.name === 'payload_json');
      if (endpoint.supports_multipart) {
        let filesParam = endpoint.jsonParams
          .find(param => param.name === 'files');
        let attachmentsParam = endpoint.jsonParams
          .find(param => param.name === 'attachments');
        attachmentsParam.schema = filesParam.schema;
        endpoint.jsonParams = endpoint.jsonParams
          .filter(param => ['files', 'payload_json'].indexOf(param.name) === -1);
        if (endpoint.method === 'PATCH') {
          endpoint.jsonParams = endpoint.jsonParams.map(param => {
            param.optional = true;
            param.isNullable = true;
            return param;
          });
        }
      }

      return endpoint;

    });

};
