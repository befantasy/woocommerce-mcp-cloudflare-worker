export class WooCommerceRestApiClient {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  version: string;

  constructor(options: { url: string; consumerKey: string; consumerSecret: string; version?: string }) {
    this.url = options.url.replace(/\/$/, '');
    this.consumerKey = options.consumerKey;
    this.consumerSecret = options.consumerSecret;
    this.version = options.version || 'wc/v3';
  }

  private async request(method: string, endpoint: string, params?: Record<string, any>, data?: any) {
    if (!this.url || !this.consumerKey || !this.consumerSecret) {
      throw new Error('WORDPRESS_SITE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET must be configured.');
    }

    let fullUrl = `${this.url}/wp-json/${this.version}/${endpoint.replace(/^\//, '')}`;
    if (params && (method === 'GET' || method === 'DELETE')) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
      }
    }

    const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
    const init: RequestInit = {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WooCommerce-MCP-Cloudflare-Worker/1.0',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      init.body = JSON.stringify(data);
    }

    const res = await fetch(fullUrl, init);
    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err: any = new Error(`HTTP ${res.status}`);
      err.response = { status: res.status, data: resData };
      throw err;
    }

    const headerObj: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headerObj[key.toLowerCase()] = value;
    });

    return {
      status: res.status,
      data: resData,
      headers: headerObj,
    };
  }

  get(endpoint: string, params?: Record<string, any>) {
    return this.request('GET', endpoint, params);
  }

  post(endpoint: string, data?: any) {
    return this.request('POST', endpoint, undefined, data);
  }

  put(endpoint: string, data?: any) {
    return this.request('PUT', endpoint, undefined, data);
  }

  delete(endpoint: string, params?: Record<string, any>) {
    return this.request('DELETE', endpoint, params);
  }
}

function getClient(): WooCommerceRestApiClient {
  const url = process.env.WORDPRESS_SITE_URL || '';
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

  return new WooCommerceRestApiClient({
    url,
    consumerKey,
    consumerSecret,
  });
}

export const wooApi = {
  get: (endpoint: string, params?: Record<string, any>) => getClient().get(endpoint, params),
  post: (endpoint: string, data?: any) => getClient().post(endpoint, data),
  put: (endpoint: string, data?: any) => getClient().put(endpoint, data),
  delete: (endpoint: string, params?: Record<string, any>) => getClient().delete(endpoint, params),
};
