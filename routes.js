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

}
