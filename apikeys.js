import crypto from 'node:crypto';

function randomString(length) {
  return crypto.randomBytes(length)
    .toString('hex')
    .slice(0, length);
}

export async function createApiKey(url, user, secret, route) {
  const template = await fetch(`${url}/api/apikeys/_template`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${user}:${secret}`).toString('base64')
    }
  });

  if (!template.ok) {
    const errorText = await template.text();
    throw new Error(`${template.status} ${errorText}`);
  }

  const validUntil = new Date();
  validUntil.setMonth(validUntil.getMonth() + 1);

  const templateBody = await template.json();

  const clientId = randomString(16);
  const apiKey = {
    ...templateBody,
    clientId,
    clientSecret: randomString(32),
    clientName: clientId,
    throttlingQuota: 10,
    dailyQuota: 1000,
    monthlyQuota: 10000,
    validUntil: validUntil.getTime()
  };

  apiKey.authorizations.push({
    kind: 'route',
    id: route.id,
  });

  const response = await fetch(`${url}/api/apikeys`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${user}:${secret}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiKey),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} ${errorText}, api key creation failed`);
  }

  return response.json();
}
