import { createRoute } from './routes.js';
import { input, password } from '@inquirer/prompts';

try {
  const url = await input({ message: 'API URL', default: process.env.OTOROSHI_API_URL });
  const user = await input({ message: 'API user', default: process.env.OTOROSHI_API_USER });
  const secret = await password({ message: 'API secret', mask: '*' });

  const route = await createRoute(url, user, secret);
}
catch (error) {
  console.log(`Error: ${error.message}`);
}
