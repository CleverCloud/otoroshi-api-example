import { createRoute } from './routes.js';
import { createApiKey, getBearer } from './apikeys.js';
import { input, password } from '@inquirer/prompts';

try {
  const url = await input({ message: 'API URL', default: process.env.OTOROSHI_API_URL });
  const user = await input({ message: 'API user', default: process.env.OTOROSHI_API_USER });
  const secret = await password({ message: 'API secret', mask: '*' });

  const route = await createRoute(url, user, secret);
  const apiKey = await createApiKey(url, user, secret, route);
  const bearer = await getBearer(url, user, secret, apiKey.clientId);

  console.log('API Key and route successfully created! Try it out:');
  console.log(`curl https://${route.frontend.domains[0]} -H 'Authorization: Bearer ${bearer}'`);
}
catch (error) {
  console.log(`Error: ${error.message}`);
}
