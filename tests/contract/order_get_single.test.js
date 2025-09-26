import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("GET /orders/{id}", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
    await mongoose.model('Order').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  let customerAuthToken;
  let customerOrderId;

  beforeAll(async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_get_single_customer_telegram_id",
      username: "order_get_single_customer_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_get_single_customer_telegram_id",
    });
    customerAuthToken = customerLoginRes.body.token;

    // Register a vendor user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_get_single_vendor_telegram_id",
      username: "order_get_single_vendor_user",
      role: "vendor",
    });

    // Login as vendor
    const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_get_single_vendor_telegram_id",
    });
    const vendorAuthToken = vendorLoginRes.body.token;

    // Create admin and get token
    const adminAuthToken = await createAdminAndGetToken();

    // Create a shop for the vendor
    const shopRes = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Vendor Shop for Single Order Get",
        description: "A shop for testing single order retrieval",
      });
    const shopId = shopRes.body.id;

    // Create a category
    const categoryRes = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: `Order Get Single Category - ${Date.now()}`,
      });
    const categoryId = categoryRes.body.id;

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product for Single Order Get",
        description: "This product will be ordered",
        price: 40.0,
        category: categoryId,
        shop: shopId,
      });
    const productId = productRes.body.id;

    // Add item to customer's cart
    await request(global.server)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        productId: productId,
        quantity: 1,
      });

    // Customer places an order
    const orderRes = await request(global.server)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${customerAuthToken}`);
    customerOrderId = orderRes.body[0]?.id;
  });

  it("should return 200 and the order details for a valid ID when authenticated as owner or admin", async () => {
    const res = await request(global.server)
      .get(`/api/v1/orders/${customerOrderId}`)
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", customerOrderId);
    expect(res.body).toHaveProperty("status", "pending");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).get(`/api/v1/orders/${customerOrderId}`);

    expect(res.statusCode).toEqual(401);
  });

  it("should return 404 for an invalid order ID", async () => {
    const res = await request(global.server)
      .get("/api/v1/orders/invalid_id")
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(res.statusCode).toEqual(404);
  });
});
