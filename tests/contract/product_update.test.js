import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("PATCH /products/{id}", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Category').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let vendorAuthToken;
  let productId;

  beforeAll(async () => {
    const adminAuthToken = await createAdminAndGetToken();
    vendorAuthToken = await createVendorAndGetToken(
      "product_update_vendor_telegram_id",
      "product_update_vendor_user"
    );
    const shopId = await createShop(
      vendorAuthToken,
      "Vendor Shop for Product Update",
      "A shop for testing product update"
    );
    const categoryId = await createCategory(adminAuthToken, "Product Update Category");

    // Create a product to update
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product to Update",
        description: "This product will be updated",
        price: 10.0,
        category: categoryId,
        shop: shopId,
      });
    productId = productRes.body.id;
  });

  it("should return 200 and the updated product details when authenticated as vendor", async () => {
    const res = await request(global.server)
      .patch(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Updated Product Name",
        price: 12.5,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", productId);
    expect(res.body).toHaveProperty("name", "Updated Product Name");
    expect(res.body).toHaveProperty("price", 12.5);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).patch(`/api/v1/products/${productId}`).send({
      name: "Unauthorized Update",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 403 if authenticated as a non-vendor user", async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "customer_product_update_telegram_id",
      username: "customer_product_update_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "customer_product_update_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    const res = await request(global.server)
      .patch(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        name: "Customer Attempt Update",
      });

    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 for an invalid product ID", async () => {
    const res = await request(global.server)
      .patch("/api/v1/products/invalid_id")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Non Existent Product",
      });

    expect(res.statusCode).toEqual(404);
  });
});
