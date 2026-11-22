const { migrateCatalog } = require("../scripts/migrate-catalog");

describe("catalog data migration", () => {
  it("copies categories, products, and their links in one destination transaction", async () => {
    const category = {
      id: 2,
      name: "Books",
      description: "Books",
      is_deleted: 0,
      created_at: null,
      updated_at: null,
    };
    const product = {
      id: 9,
      admin_id: 3,
      name: "Example",
      description: "Example product",
      price: "10.00",
      is_deleted: 0,
      image_url: null,
      created_at: null,
      updated_at: null,
    };
    const link = { product_id: 9, category_id: 2 };
    const source = {
      execute: jest.fn(async (sql) => {
        if (sql.includes("FROM categories")) return [[category]];
        if (sql.includes("FROM products")) return [[product]];
        return [[link]];
      }),
      end: jest.fn(),
    };
    const target = {
      beginTransaction: jest.fn(),
      execute: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      end: jest.fn(),
    };
    const connect = jest.fn()
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(target);
    const invalidateCache = jest.fn();

    await migrateCatalog(connect, invalidateCache);

    expect(target.beginTransaction).toHaveBeenCalledTimes(1);
    expect(target.execute).toHaveBeenCalledTimes(3);
    expect(target.execute.mock.calls[0][0]).toContain("INSERT INTO categories");
    expect(target.execute.mock.calls[1][0]).toContain("INSERT INTO products");
    expect(target.execute.mock.calls[2][0]).toContain("INSERT IGNORE INTO product_categories");
    expect(target.commit).toHaveBeenCalledTimes(1);
    expect(invalidateCache).toHaveBeenCalledTimes(1);
    expect(target.rollback).not.toHaveBeenCalled();
    expect(source.end).toHaveBeenCalledTimes(1);
    expect(target.end).toHaveBeenCalledTimes(1);
  });

  it("rolls back the destination transaction when a catalog insert fails", async () => {
    const source = {
      execute: jest.fn(async (sql) => {
        if (sql.includes("FROM categories")) return [[{}]];
        if (sql.includes("FROM products")) return [[{ id: 1 }]];
        return [[]];
      }),
      end: jest.fn(),
    };
    const target = {
      beginTransaction: jest.fn(),
      execute: jest.fn().mockRejectedValue(new Error("insert failed")),
      commit: jest.fn(),
      rollback: jest.fn(),
      end: jest.fn(),
    };
    const connect = jest.fn()
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(target);

    const invalidateCache = jest.fn();
    await expect(migrateCatalog(connect, invalidateCache)).rejects.toThrow("insert failed");

    expect(target.rollback).toHaveBeenCalledTimes(1);
    expect(target.commit).not.toHaveBeenCalled();
    expect(invalidateCache).not.toHaveBeenCalled();
    expect(source.end).toHaveBeenCalledTimes(1);
    expect(target.end).toHaveBeenCalledTimes(1);
  });

  it("refuses to migrate from an empty legacy database", async () => {
    const source = {
      execute: jest.fn(async () => [[]]),
      end: jest.fn(),
    };
    const target = {
      execute: jest.fn(),
      end: jest.fn(),
    };
    const connect = jest.fn()
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(target);

    const invalidateCache = jest.fn();
    await expect(migrateCatalog(connect, invalidateCache)).rejects.toThrow("No products found");

    expect(target.execute).not.toHaveBeenCalled();
    expect(invalidateCache).not.toHaveBeenCalled();
    expect(source.end).toHaveBeenCalledTimes(1);
    expect(target.end).toHaveBeenCalledTimes(1);
  });
});
