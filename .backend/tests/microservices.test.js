jest.mock("../db", () => ({
  query: jest.fn(),
}));

const db = require("../db");
const orderController = require("../controllers/orderController");
const usersController = require("../controllers/usersController");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const createResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return res;
};

describe("Orders service boundaries", () => {
  const originalFetch = global.fetch;
  const originalServiceName = process.env.SERVICE_NAME;
  const originalServiceSecret = process.env.SERVICE_TO_SERVICE_SECRET;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    db.query.mockReset();
    process.env.SERVICE_TO_SERVICE_SECRET = "test-service-token";
    global.fetch = jest.fn(async (url, options = {}) => {
      if (url.endsWith("/cart/internal/users/8") || url.endsWith("/orders/internal/users/8")) {
        return { ok: true, status: 204, json: async () => null };
      }
      if (url.endsWith("/users/me")) {
        return { ok: true, status: 200, json: async () => ({ addresses: [{}], cards: [{}] }) };
      }
      if (url.endsWith("/cart") && options.method !== "DELETE") {
        return { ok: true, status: 200, json: async () => [{ product_id: 7, quantity: 2 }] };
      }
      if (url.endsWith("/products/7")) {
        return { ok: true, status: 200, json: async () => ({ name: "Test item", price: "12.34" }) };
      }
      if (url.endsWith("/cart") && options.method === "DELETE") {
        return { ok: true, status: 204, json: async () => null };
      }
      throw new Error(`Unexpected service request: ${url}`);
    });
    db.query.mockImplementation((sql, params, callback) => {
      if (sql.startsWith("INSERT INTO orders")) {
        callback(null, { insertId: 25 });
      } else if (sql.startsWith("INSERT INTO order_items")) {
        callback(null, { insertId: 1 });
      } else if (sql.startsWith("DELETE FROM users")) {
        callback(null, { affectedRows: 1 });
      } else {
        callback(null, {});
      }
    });
  });

  afterAll(() => {
    global.fetch = originalFetch;
    if (originalServiceName === undefined) delete process.env.SERVICE_NAME;
    else process.env.SERVICE_NAME = originalServiceName;
    if (originalServiceSecret === undefined) delete process.env.SERVICE_TO_SERVICE_SECRET;
    else process.env.SERVICE_TO_SERVICE_SECRET = originalServiceSecret;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  it("calculates and persists order lines from service-owned data, not the request total", async () => {
    const req = {
      user: { id: 8 },
      headers: { authorization: "Bearer customer-token" },
      body: { total: 0, items: [] },
    };
    const res = createResponse();

    await orderController.createOrder(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({ orderId: 25, total: "24.68", status: "pending", cartCleared: true });
    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)",
      [8, "24.68", "pending"],
      expect.any(Function),
    );
    expect(db.query).toHaveBeenCalledWith(
      "INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
      [25, 7, "Test item", 2, "12.34"],
      expect.any(Function),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "http://catalog:3001/products/7",
      expect.objectContaining({ headers: { Authorization: "Bearer customer-token" } }),
    );
  });

  it("cleans Cart and Orders before deleting the account record", async () => {
    process.env.SERVICE_NAME = "users";
    process.env.SERVICE_TO_SERVICE_SECRET = "test-service-token";
    const req = { user: { id: 8 } };
    const res = createResponse();

    await usersController.deleteAccount(req, res);

    expect(res.statusCode).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://cart:3001/cart/internal/users/8",
      expect.objectContaining({
        method: "DELETE",
        headers: { "x-service-token": "test-service-token" },
      }),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "http://orders:3001/orders/internal/users/8",
      expect.objectContaining({
        method: "DELETE",
        headers: { "x-service-token": "test-service-token" },
      }),
    );
    expect(db.query).toHaveBeenCalledWith(
      "DELETE FROM users WHERE id = ?",
      [8],
      expect.any(Function),
    );
  });

  it("preserves the account when dependent-service cleanup fails", async () => {
    process.env.SERVICE_NAME = "users";
    process.env.SERVICE_TO_SERVICE_SECRET = "test-service-token";
    global.fetch.mockImplementation(async (url) => {
      if (url.endsWith("/orders/internal/users/8")) {
        return { ok: false, status: 503, json: async () => ({ error: "Orders unavailable" }) };
      }
      return { ok: true, status: 204, json: async () => null };
    });
    const res = createResponse();

    await usersController.deleteAccount({ user: { id: 8 } }, res);

    expect(res.statusCode).toBe(503);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("checks account existence and current admin status with Users", async () => {
    process.env.SERVICE_NAME = "catalog";
    process.env.JWT_SECRET = "test-jwt-secret";
    global.fetch.mockImplementation(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ user: { id: 8, is_admin: false } }),
    }));
    const req = {
      headers: { authorization: `Bearer ${jwt.sign({ id: 8, is_admin: true }, process.env.JWT_SECRET)}` },
    };
    const res = createResponse();
    const next = jest.fn();

    await auth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.is_admin).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://users:3001/users/internal/validate",
      expect.objectContaining({
        headers: {
          Authorization: expect.stringMatching(/^Bearer /),
          "x-service-token": process.env.SERVICE_TO_SERVICE_SECRET,
        },
      }),
    );
  });

  it("rejects a valid JWT after its account has been deleted", async () => {
    process.env.SERVICE_NAME = "cart";
    process.env.JWT_SECRET = "test-jwt-secret";
    global.fetch.mockImplementation(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ error: "User not found" }),
    }));
    const req = {
      headers: { authorization: `Bearer ${jwt.sign({ id: 8 }, process.env.JWT_SECRET)}` },
    };
    const res = createResponse();
    const next = jest.fn();

    await auth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Account is no longer available" });
    expect(next).not.toHaveBeenCalled();
  });
});
