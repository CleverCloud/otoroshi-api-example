![Logo Clever Cloud](./assets/clever-cloud-logo.png)

# Manage an Otoroshi API gateway on Clever Cloud through its admin API
[![Clever Cloud - PaaS](https://img.shields.io/badge/Clever%20Cloud-PaaS-orange)](https://clever-cloud.com)

This example shows how to drive the [Otoroshi](https://www.otoroshi.io/) add-on of Clever Cloud programmatically. It is a small Node.js command-line tool (no framework, native `fetch`) that calls the Otoroshi admin API to create a route protected by an API key, creates that API key, and prints a ready-to-use `curl` command with a bearer token.

The tool runs on your machine (Node.js 24 LTS or later); the only thing deployed on Clever Cloud is the Otoroshi add-on itself.

## How it works

1. `routes.js` fetches the route template (`GET /api/routes/_template`), points its backend to `https://example.com/api`, adds the `ApikeyCalls` plugin so that every call requires a valid API key, and creates the route (`POST /api/routes`).
2. `apikeys.js` fetches the API key template (`GET /api/apikeys/_template`), creates a key authorized on the new route with throttling, daily and monthly quotas and a one-month validity (`POST /api/apikeys`), then retrieves its bearer token (`GET /api/apikeys/:id/bearer`).
3. `index.js` prompts for the admin API URL, client ID and secret (using [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts)), chains the calls above and prints the `curl` command.

All calls authenticate with HTTP Basic auth using the admin API client ID and secret provided by the add-on.

## Project structure

```
.
├── index.js       # Entry point: prompts for credentials and chains the API calls
├── routes.js      # Creates an Otoroshi route protected by the ApikeyCalls plugin
├── apikeys.js     # Creates an API key for the route and fetches its bearer token
├── package.json   # Node.js engine (>= 24) and dependencies
└── package-lock.json
```

## Deployment steps

Create an Otoroshi add-on with [Clever Tools](https://github.com/CleverCloud/clever-tools):

```bash
npm i -g clever-tools
clever login

clever addon create otoroshi my-otoroshi --plan base --region par
```

The command output gives the Otoroshi UI URL and an initial admin account. The add-on starts a Java application and a Redis add-on in your organisation; wait a minute or two for it to come up.

Get the admin API credentials from the environment of the Java application created by the add-on (its ID is shown by `clever applications list` and in the Console):

```bash
clever env --app <otoroshi_java_app_id> | grep CC_OTOROSHI_API
# CC_OTOROSHI_API_URL, CC_OTOROSHI_API_CLIENT_ID, CC_OTOROSHI_API_CLIENT_SECRET
```

## Running locally

```bash
npm ci

# Optional: pre-fill the first two prompts
export OTOROSHI_API_URL="<CC_OTOROSHI_API_URL>"
export OTOROSHI_API_USER="<CC_OTOROSHI_API_CLIENT_ID>"

npm start
```

Enter `CC_OTOROSHI_API_CLIENT_SECRET` when asked for the API secret. The tool prints something like:

```
API Key and route successfully created! Try it out:
curl https://app-xxxxxxxx.cleverapps.io -H 'Authorization: Bearer eyJ...'
```

Without the `Authorization` header, Otoroshi answers `400 {"Otoroshi-Error":"no apikey"}`. With it, the request is forwarded to the backend (`https://example.com/api`, which itself answers 404: replace the target in `routes.js` with your own API).

## Troubleshooting

- `400` or `401` on the first call: check the URL and that you used the API client ID and secret, not the UI admin account.
- `{"Otoroshi-Error":"no route found !"}` right after creation: Otoroshi syncs its configuration every few seconds, retry shortly.
- Check the gateway with `clever logs --app <otoroshi_java_app_id>`.
- The tool requires Node.js 24 or later (`node -v`).

## Contributing

Contributions to improve this deployment example are welcome! Please feel free to submit pull requests or open issues for any enhancements or bug fixes.

## License

This example is provided under the terms of the ISC license, as declared in `package.json`.
