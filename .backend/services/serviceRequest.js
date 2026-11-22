const serviceUrls = {
  catalog: process.env.CATALOG_SERVICE_URL || "http://catalog:3001",
  users: process.env.USERS_SERVICE_URL || "http://users:3001",
  cart: process.env.CART_SERVICE_URL || "http://cart:3001",
  orders: process.env.ORDERS_SERVICE_URL || "http://orders:3001",
};

const requestService = async (service, path, options = {}) => {
  const url = serviceUrls[service];
  if (!url) throw new Error(`Unknown service: ${service}`);

  const headers = { ...options.headers };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.internal) {
    const secret = process.env.SERVICE_TO_SERVICE_SECRET;
    if (!secret) throw new Error("SERVICE_TO_SERVICE_SECRET is not configured");
    headers["x-service-token"] = secret;
  }

  const response = await fetch(`${url}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
    signal: AbortSignal.timeout(Number(process.env.SERVICE_REQUEST_TIMEOUT_MS || 5000)),
  });
  const responseBody = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(responseBody?.error || responseBody?.message || `${service} service returned ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return responseBody;
};

module.exports = { requestService };
