// Fix endpoints generated from format_endpoints.js

const fixes = [

  // Sets appropriate return type
  // Improvement: could use actual schema from sample data
  {
    name: 'Set return types',
    applyFix: (endpoints) => {

      return endpoints.map(endpoint => {
        if (endpoint.name.endsWith('/list') || endpoint.name.endsWith('/search')) {
          endpoint.returns = {
            type: 'array'
          };
        } else {
          endpoint.returns = {
            type: 'object'
          };
        }
        return endpoint;
      });

    }
  },

  // Not all endpoints are valid for bots
  // We should filter these out of the schema when generating
  {
    name: 'Remove disabled endpoints',
    applyFix: (endpoints) => {

      const disabledEndpointNames = [
        'users/me/applications/roleConnection/retrieve',
        'users/me/applications/roleConnection/update',
        'roleConnections/metadata/retrieve',
        'roleConnections/metadata/update'
      ];

      return endpoints.filter(endpoint => {
        return !disabledEndpointNames.includes(endpoint.name)
      });

    }
  },

];

module.exports = async (formattedEndpoints) => {

  fixes.forEach(fix => {
    console.log(`Applying fix "${fix.name}"...`);
    let fixedEndpoints = fix.applyFix(formattedEndpoints);
    if (!Array.isArray(fixedEndpoints)) {
      throw new Error(`Fixes must return an array of endpoints`);
    }
    formattedEndpoints = fixedEndpoints;
  });

  return formattedEndpoints;

};
