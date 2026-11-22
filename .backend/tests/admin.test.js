const admin = require("../middleware/admin");

describe("administrator middleware", () => {
  const response = () => ({
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  });

  it("allows administrators", () => {
    const res = response();
    const next = jest.fn();

    admin({ user: { is_admin: true } }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeNull();
  });

  it("rejects regular authenticated users", () => {
    const res = response();
    const next = jest.fn();

    admin({ user: { is_admin: false } }, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Administrator access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects requests without an authenticated user", () => {
    const res = response();
    const next = jest.fn();

    admin({}, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
