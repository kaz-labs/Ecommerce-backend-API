import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("GET /orders", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
    await mongoose.model('Order').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  let customerAuthToken;
  let vendorAuthToken;
  let customerOrderId;
  let vendorShopId;

  beforeAll(async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_get_all_customer_telegram_id",
      username: "order_get_all_customer_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_get_all_customer_telegram_id",
    });
    customerAuthToken = customerLoginRes.body.token;

    // Register a vendor user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "order_get_all_vendor_telegram_id",
      username: "order_get_all_vendor_user",
      role: "vendor",
    });

    // Login as vendor
    const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_get_all_vendor_telegram_id",
    });
    vendorAuthToken = vendorLoginRes.body.token;

    // Create admin and get token
    const adminAuthToken = await createAdminAndGetToken();

    // Create a shop for the vendor
    const shopRes = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Vendor Shop for Get Orders",
        description: "A shop for testing get orders",
      });
    vendorShopId = shopRes.body.id;

    // Re-login vendor to get updated token with shop info
    const vendorReLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "order_get_all_vendor_telegram_id",
    });
    vendorAuthToken = vendorReLoginRes.body.token;

    // Create a category
    const categoryRes = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: `Order Get All Category - ${Date.now()}`,
      });
    const categoryId = categoryRes.body.id;

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product for Order Get All",
        description: "This product will be ordered",
        price: 35.0,
        category: categoryId,
        shop: vendorShopId,
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
    customerOrderId = orderRes.body[0].id; // Get the ID from the first order in the array

    // Register another customer user for vendor's order
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "vendor_order_customer_telegram_id",
      username: "vendor_order_customer_user",
    });

    // Login as this new customer
    const vendorOrderCustomerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "vendor_order_customer_telegram_id",
    });
    const vendorOrderCustomerAuthToken = vendorOrderCustomerLoginRes.body.token;

    // Add item from vendor's shop to this new customer's cart
    await request(global.server)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${vendorOrderCustomerAuthToken}`)
      .send({
        productId: productId,
        quantity: 1,
      });

    // This new customer places an order for the vendor's shop
    const vendorCustomerOrderRes = await request(global.server)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${vendorOrderCustomerAuthToken}`);
    // No need to store vendorCustomerOrderId for this test, just ensure it's created
  });

  it("should return 200 and a list of orders for the current customer when authenticated", async () => {
    const res = await request(global.server)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id", customerOrderId);
  });

  it("should return 200 and a list of orders for the current vendor's shop when authenticated as vendor", async () => {
    const res = await request(global.server)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${vendorAuthToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("shop", vendorShopId);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).get("/api/v1/orders");

    expect(res.statusCode).toEqual(401);
  });
});
