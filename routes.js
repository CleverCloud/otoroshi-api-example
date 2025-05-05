export async function createRoute(url, user, secret) {

  // On récupère le template d'une route avec une requête HTTP de type GET
  const template = await fetch(`${url}/api/routes/_template`, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${user}:${secret}`).toString('base64')
    }
  });

  if (!template.ok) {
    const errorText = await template.text();
    throw new Error(`${template.status} ${errorText}`);
  }

  const route = await template.json();

  route.backend.root = '/api';
  route.backend.targets = [
    {
      "hostname": "example.com",
      "port": 443,
      "tls": true,
    }
  ];

  route.plugins.push({
    "plugin": "cp:otoroshi.next.plugins.ApikeyCalls",
    config: {
      "mandatory": true,
      "pass_with_user": false,
      "update_quotas": true,
      "validate": true,
      "wipe_backend_request": true,
    }
  });

  const response = await fetch(`${url}/api/routes`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${user}:${secret}`).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(route),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} ${errorText}, route creation failed`);
  }
  return response.json();
}
