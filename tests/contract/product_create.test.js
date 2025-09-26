import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("POST /products", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Category').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let vendorAuthToken;
  let categoryId;
  let shopId;

  beforeAll(async () => {
    const adminAuthToken = await createAdminAndGetToken();
    vendorAuthToken = await createVendorAndGetToken(
      "product_create_vendor_telegram_id",
      "product_create_vendor_user"
    );
    shopId = await createShop(
      vendorAuthToken,
      "Vendor Shop for Product Create",
      "A shop for testing product creation"
    );
    categoryId = await createCategory(adminAuthToken, "Product Create Category");
  });

  it("should return 201 and the new product when authenticated as a vendor", async () => {
    const res = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Test Product",
        description: "This is a test product",
        price: 9.99,
        category: categoryId,
        shop: shopId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "Test Product");
    expect(res.body).toHaveProperty("description", "This is a test product");
    expect(res.body).toHaveProperty("price", 9.99);
    expect(res.body).toHaveProperty("category", categoryId);
    expect(res.body).toHaveProperty("shop", shopId);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).post("/api/v1/products").send({
      name: "Unauthorized Product",
      description: "Should not be created",
      price: 1.0,
      category: categoryId,
      shop: shopId,
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 403 if authenticated as a non-vendor user", async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "customer_product_create_telegram_id",
      username: "customer_product_create_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "customer_product_create_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    const res = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        name: "Customer Product",
        description: "Should not be created by customer",
        price: 2.0,
        category: categoryId,
        shop: shopId,
      });

    expect(res.statusCode).toEqual(403);
  });
});
