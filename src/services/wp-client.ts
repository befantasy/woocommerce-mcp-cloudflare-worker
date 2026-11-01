interface WpResponse {
  data: any;
  headers: Record<string, string>;
}

async function request(
  method: string,
  endpoint: string,
  params?: Record<string, any>
): Promise<WpResponse> {
  const urlBase = process.env.WORDPRESS_SITE_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;

  if (!urlBase) {
    throw new Error('WORDPRESS_SITE_URL environment variable is required');
  }
  if (!username || !password) {
    throw new Error(
      'WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD are required for WordPress API operations'
    );
  }

  const baseUrl = `${urlBase.replace(/\/$/, '')}/wp-json/wp/v2`;
  const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

  let urlStr = `${baseUrl}/${endpoint.replace(/^\//, '')}`;

  if ((method === 'GET' || method === 'DELETE') && params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) urlStr += (urlStr.includes('?') ? '&' : '?') + qs;
  }

  const init: RequestInit = {
    method,
    headers: { Authorization: authHeader },
  };

  if ((method === 'POST' || method === 'PUT') && params) {
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
    init.body = JSON.stringify(params);
  }

  const response = await fetch(urlStr, init);

  const headerObj: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headerObj[key.toLowerCase()] = value;
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(`HTTP ${response.status}`);
    error.response = { data: errorData, status: response.status };
    throw error;
  }

  const data = await response.json();
  return { data, headers: headerObj };
}

export const wpApi = {
  get: (endpoint: string, params?: Record<string, any>) => request('GET', endpoint, params),
  delete: (endpoint: string, params?: Record<string, any>) => request('DELETE', endpoint, params),
};
