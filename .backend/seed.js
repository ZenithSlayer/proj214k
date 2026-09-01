const mysql = require('mysql2/promise');
require('dotenv').config();

const CONFIG = {
  USERS: 50,
  ADMINS: 5,
  CATEGORIES: 20,
  PRODUCTS: 1000,
  CART_ITEMS: 200,
  ORDERS: 40,
};

async function main() {
  const { faker } = await import('@faker-js/faker');

  console.log("Connecting to the database...");
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "projeto22026", // Fallback added here
  });

  console.log("Clearing old tables...");
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  const tables = ['cart', 'order_items', 'orders', 'credit_cards', 'addresses', 'product_categories', 'products', 'categories', 'users'];
  for (const table of tables) {
    await connection.query(`TRUNCATE TABLE ${table}`);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log("Generating users...");
  const users = [];
  for (let i = 0; i < CONFIG.USERS; i++) {
    users.push([
      faker.person.fullName(),
      faker.internet.email(),
      faker.internet.password(),
      faker.string.numeric(11),
      i < CONFIG.ADMINS ? 1 : 0
    ]);
  }
  await connection.query(`INSERT INTO users (name, email, password, cpf, is_admin) VALUES ?`, [users]);

  console.log("Generating categories...");
  const categories = [];
  const uniqueCategoryNames = new Set();
  while (uniqueCategoryNames.size < CONFIG.CATEGORIES) {
    uniqueCategoryNames.add(faker.commerce.department());
  }
  const categoryArray = Array.from(uniqueCategoryNames);
  for (let i = 0; i < CONFIG.CATEGORIES; i++) {
    categories.push([
      categoryArray[i],
      faker.lorem.paragraph()
    ]);
  }
  await connection.query(`INSERT INTO categories (name, description) VALUES ?`, [categories]);

  console.log("Generating products...");
  const products = [];
  for (let i = 0; i < CONFIG.PRODUCTS; i++) {
    products.push([
      faker.number.int({ min: 1, max: CONFIG.ADMINS }),
      faker.commerce.productName() + " " + i,
      faker.commerce.productDescription(),
      faker.commerce.price({ min: 10, max: 1000 }),
      faker.helpers.arrayElement([0, 0, 0, 1]),
      faker.image.url()
    ]);
  }
  await connection.query(`INSERT INTO products (admin_id, name, description, price, is_deleted, image_url) VALUES ?`, [products]);

  console.log("Linking products to categories...");
  const productCategories = [];
  for (let i = 1; i <= CONFIG.PRODUCTS; i++) {
    const numCategories = faker.number.int({ min: 1, max: 3 });
    const selectedCats = faker.helpers.arrayElements(
      Array.from({ length: CONFIG.CATEGORIES }, (_, i) => i + 1),
      numCategories
    );
    selectedCats.forEach(catId => {
      productCategories.push([i, catId]);
    });
  }
  await connection.query(`INSERT IGNORE INTO product_categories (product_id, category_id) VALUES ?`, [productCategories]);

  console.log("Generating addresses and credit cards...");
  const addresses = [];
  const creditCards = [];
  for (let i = 1; i <= CONFIG.USERS; i++) {
    addresses.push([
      i, faker.location.country(), faker.location.state(), faker.location.city(),
      faker.location.street(), faker.number.int({ min: 1, max: 9999 }).toString(),
      1, faker.location.zipCode('########')
    ]);
    creditCards.push([
      i, faker.finance.creditCardNumber('####-####-####-####'),
      faker.finance.creditCardCVV(), faker.date.future().toISOString().split('T')[0], 1
    ]);
  }
  await connection.query(`INSERT INTO addresses (user_id, country, state, city, street, number, is_favorite, postal_code) VALUES ?`, [addresses]);
  await connection.query(`INSERT INTO credit_cards (user_id, card_number, security_code, expiration_date, is_favorite) VALUES ?`, [creditCards]);

  console.log("Generating orders...");
  const orders = [];
  for (let i = 1; i <= CONFIG.ORDERS; i++) {
    orders.push([
      faker.number.int({ min: 1, max: CONFIG.USERS }),
      faker.commerce.price({ min: 50, max: 5000 }),
      faker.helpers.arrayElement(['pending', 'paid', 'shipped', 'delivered'])
    ]);
  }
  const [orderRes] = await connection.query(`INSERT INTO orders (user_id, total, status) VALUES ?`, [orders]);
  
  console.log("Generating order items...");
  const orderItems = [];
  for (let i = 0; i < CONFIG.ORDERS; i++) {
    const orderId = orderRes.insertId + i;
    orderItems.push([
      orderId, 
      faker.number.int({ min: 1, max: CONFIG.PRODUCTS }), 
      faker.number.int({ min: 1, max: 5 }), 
      faker.commerce.price({ min: 10, max: 1000 })
    ]);
  }
  await connection.query(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`, [orderItems]);

  console.log("Generating cart items...");
  const cartItems = [];
  for (let i = 0; i < CONFIG.CART_ITEMS; i++) {
    cartItems.push([
      faker.number.int({ min: 1, max: CONFIG.USERS }),
      faker.number.int({ min: 1, max: CONFIG.PRODUCTS }),
      faker.number.int({ min: 1, max: 5 })
    ]);
  }
  await connection.query(`INSERT INTO cart (user_id, product_id, quantity) VALUES ?`, [cartItems]);

  await connection.end();
  console.log("Database populated successfully!");
}

main().catch(err => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});