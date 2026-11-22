const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const sourceConfig = {
  host: process.env.LEGACY_DB_HOST || "127.0.0.1",
  port: Number(process.env.LEGACY_DB_PORT || 3306),
  user: process.env.LEGACY_DB_USER || "root",
  password: process.env.LEGACY_DB_PASSWORD || "",
  database: process.env.LEGACY_DB_NAME || "projeto22026",
};

const targetConfig = {
  host: process.env.CATALOG_DB_HOST || "127.0.0.1",
  port: Number(process.env.CATALOG_DB_PORT || 3307),
  user: process.env.DB_USER || "proj214k_app",
  password: process.env.DB_PASSWORD || "",
  database: "catalog",
};

const invalidateCatalogCache = async () => {
  const secret = process.env.SERVICE_TO_SERVICE_SECRET;
  if (!secret) {
    console.warn("Catalog cache was not invalidated: SERVICE_TO_SERVICE_SECRET is not configured.");
    return;
  }

  try {
    const port = process.env.HTTP_PORT || "8080";
    const response = await fetch(
      process.env.CATALOG_CACHE_INVALIDATION_URL || `http://127.0.0.1:${port}/internal/catalog/cache/invalidate`,
      {
        method: "POST",
        headers: { "x-service-token": secret },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) {
      console.warn(`Catalog data was migrated, but cache invalidation returned HTTP ${response.status}. Cached data will expire by TTL.`);
    }
  } catch (error) {
    console.warn(`Catalog data was migrated, but cache invalidation failed: ${error.message}. Cached data will expire by TTL.`);
  }
};

const migrateCatalog = async (
  connect = mysql.createConnection,
  invalidateCache = invalidateCatalogCache,
) => {
  const source = await connect(sourceConfig);
  let target;

  try {
    target = await connect(targetConfig);
    const [categories] = await source.execute(
      "SELECT id, name, description, is_deleted, created_at, updated_at FROM categories",
    );
    const [products] = await source.execute(
      "SELECT id, admin_id, name, description, price, is_deleted, image_url, created_at, updated_at FROM products",
    );
    const [productCategories] = await source.execute(
      "SELECT product_id, category_id FROM product_categories",
    );

    if (products.length === 0) {
      throw new Error(`No products found in legacy database "${sourceConfig.database}"; catalog migration was not applied.`);
    }

    await target.beginTransaction();
    for (const category of categories) {
      await target.execute(
        `INSERT INTO categories (id, name, description, is_deleted, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description),
           is_deleted = VALUES(is_deleted), updated_at = VALUES(updated_at)`,
        [category.id, category.name, category.description, category.is_deleted, category.created_at, category.updated_at],
      );
    }

    for (const product of products) {
      await target.execute(
        `INSERT INTO products (id, admin_id, name, description, price, is_deleted, image_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE admin_id = VALUES(admin_id), name = VALUES(name),
           description = VALUES(description), price = VALUES(price), is_deleted = VALUES(is_deleted),
           image_url = VALUES(image_url), updated_at = VALUES(updated_at)`,
        [
          product.id,
          product.admin_id,
          product.name,
          product.description,
          product.price,
          product.is_deleted,
          product.image_url,
          product.created_at,
          product.updated_at,
        ],
      );
    }

    for (const link of productCategories) {
      await target.execute(
        "INSERT IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)",
        [link.product_id, link.category_id],
      );
    }

    await target.commit();
    await invalidateCache();
    console.info(`Catalog migration completed: ${categories.length} categories, ${products.length} products, ${productCategories.length} category links.`);
  } catch (error) {
    if (target) {
      try {
        await target.rollback();
      } catch (rollbackError) {
        console.error("Could not roll back the catalog migration:", rollbackError.message);
      }
    }
    throw error;
  } finally {
    await Promise.all([
      source.end(),
      target ? target.end() : Promise.resolve(),
    ]);
  }
};

if (require.main === module) {
  migrateCatalog().catch((error) => {
    console.error("Catalog migration failed:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { migrateCatalog };
