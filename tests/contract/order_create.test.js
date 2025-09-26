import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import
// import { Product } from "../../src/models/Product.js"; // Removed direct import
// import { Cart } from "../../src/models/Cart.js"; // Removed direct import
// import { Order } from "../../src/models/Order.js"; // Removed direct import

describe("POST /orders", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
    await mongoose.model('Order').deleteMany({});
  });

  afterEach(async () => {
    // Only clear data that is specific to each test, not shared setup data
  });

  let authToken;
  let productId;
  let vendorShopId;
  let vendorAuthToken;

  beforeAll(async () => {
    // Register and login a user to get an auth token
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_create_telegram_id",
      username: "order_create_user",
    });

    const loginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_create_telegram_id",
    });
    authToken = loginRes.body.token;

    // Register a vendor user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_create_vendor_telegram_id",
      username: "order_create_vendor_user",
      role: "vendor",
    });

    // Login as vendor
    const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_create_vendor_telegram_id",
    });
    vendorAuthToken = vendorLoginRes.body.token;

    const shopRes = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Vendor Shop for Order Create",
        description: "A shop for testing order creation",
      });
    vendorShopId = shopRes.body.id;

    // Register an admin user and get token for category creation
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_create_admin_telegram_id",
      username: "order_create_admin_user",
      role: "admin",
    });
    const adminLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_create_admin_telegram_id",
    });
    const adminAuthToken = adminLoginRes.body.token;

    // Create a category
    const categoryRes = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: "Order Create Category",
      });
    const categoryId = categoryRes.body.id;

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product for Order",
        description: "This product will be ordered",
        price: 30.0,
        category: categoryId,
        shop: vendorShopId, // Use the actual shopId here
      });
    productId = productRes.body.id;

    // Add item to cart
    await request(global.server).post("/api/v1/cart").set("Authorization", `Bearer ${authToken}`).send({
      productId: productId,
      quantity: 1,
    });
  });

  it("should return 201 and the new order when authenticated and cart is not empty", async () => {
    const res = await request(global.server)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("items");
    expect(res.body[0].items[0]).toHaveProperty("product", productId);
    expect(res.body[0].items[0]).toHaveProperty("quantity", 1);
    expect(res.body[0]).toHaveProperty("status", "pending");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).post("/api/v1/orders");

    expect(res.statusCode).toEqual(401);
  });
});
