# Discord API Generator for Autocode

This project automatically generates an Autocode Standard Library API from the
most recent version of the Discord API docs.

1. [Instructions](#instructions)
2. [Contributing](#contributing)
  1. [Endpoint fixes](#endpoint-fixes)
  2. [Schema improvements](#schema-improvements)
  3. [Bug fixes](#bug-fixes)
3. [Testing endpoints](#testing-endpoints)
4. [Thank you](#thank-you)

## Instructions

This repository generates a group of Autocode "Connector APIs", or APIs
available as integrations, for all documented Discord endpoints based on the
v10 API documentation. To use this tool;

1. Download and install the [Autocode CLI](https://github.com/acode/cli)
2. Clone this repository, and make sure you `cd` into it
3. Create an `env.json` file with the contents `{}` in the root directory
4. The terminal command `$ lib .generate.schema` will read Discord API docs and
  generate a schema in `output/schema.json`
5. The terminal command `$ lib .generate.code` will use that schema to generate
  Autocode Connector API projects for Discord in `output/discord/*`
6. `$ lib .upload` will run `lib up beta` for each endpoint, you cannot run this
  without admin permissions on the Discord Autocode account - leave for admins.

## Contributing

There are three places where you can contribute to the making the Discord API
on Autocode better:

1. **Endpoint fixes:** the regex for reading documented endpoints isn't perfect
2. **Schema improvement:** both request and return schemas are not well-documented,
  this is best implemented as an endpoint fix.
3. **Bug fixes:** There may be bugs lurking in generated code, help squash them!

When submitting a fix, make sure to always run `lib .generate.schema` and
`lib .generate.code` before submitting a PR, so we can validate that the code
and schema generated as expected.

### Endpoint fixes

Endpoint schemas are generated via `1_read_docs.js`, basically applying regular
expressions to Discord's API docs on GitHub. There are edge cases regex doesn't
catch, like all parameters being optional. We apply these as **fixes** in
`3_fix_endpoints.js`, where the start of the file looks like:

```javascript
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
```

You can add custom fixes here. They'll apply to `./output/schema.json` after
running `lib .generate.schema`. You can then re-run code generation with
`lib .generate.code`. The `applyFix()` function should always return an array
of endpoints.

### Schema improvements

The top-level parameters for most API endpoints are included in API generation.
However, in `./output/schema.json` you'll notice some parameters have
`"object_reference":` or `"partial_object_reference":` fields. Each of these
fields maps to an object in `objects.json`, though this is not currently
being used to populate the request parameter schemas.

Return parameters are not currently documented at all outside of being a
`list` or an `object`. It would be helpful to get sample data for each API
endpoint (170 endpoints!) and start populating these schemas if possible. A
change to code generation may be required.

### Bug fixes

Bugs may pop up as you're playing with the endpoints! Please feel free to submit
PRs that fix these bugs.

## Testing endpoints

To test endpoints locally without having the Autocode team have to redeploy,
generate code with:

```
$ lib .generate.code --DISCORD_BOT_TOKEN {botToken} --DISCORD_CLIENT_ID {clientId}`
```

Where `{botToken}` and `{clientId}` are a test bot token and application ID.
You can then go into the directory for the service, e.g. `$ cd ./output/discord/guilds/`
and run `$ lib http` to start a local HTTP service. You can make requests
to this server with the appropriate `application/json` POST data for the parameters.

## Thank you

Thanks for checking out the Discord API generator for Autocode, together we can
make the Discord API spec the best there is.

- [Keith Horwood](https://twitter.com/keithwhor), founder / CEO @ Autocode
