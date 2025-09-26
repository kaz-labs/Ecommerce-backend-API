import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("DELETE /products/{id}", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Category').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let vendorAuthToken;
  let productIdToDelete;

  beforeAll(async () => {
    const adminAuthToken = await createAdminAndGetToken();
    vendorAuthToken = await createVendorAndGetToken(
      "product_delete_vendor_telegram_id",
      "product_delete_vendor_user"
    );
    const shopId = await createShop(
      vendorAuthToken,
      "Vendor Shop for Product Delete",
      "A shop for testing product delete"
    );
    const categoryId = await createCategory(adminAuthToken, "Product Delete Category");

    // Create a product to delete
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product to Delete",
        description: "This product will be deleted",
        price: 10.0,
        category: categoryId,
        shop: shopId,
      });
    productIdToDelete = productRes.body.id;
  });

  it("should return 204 on successful product deletion when authenticated as vendor", async () => {
    const res = await request(global.server)
      .delete(`/api/v1/products/${productIdToDelete}`)
      .set("Authorization", `Bearer ${vendorAuthToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).delete(`/api/v1/products/${productIdToDelete}`);

    expect(res.statusCode).toEqual(401);
  });

  it("should return 403 if authenticated as a non-vendor user", async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "customer_product_delete_telegram_id",
      username: "customer_product_delete_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "customer_product_delete_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    const res = await request(global.server)
      .delete(`/api/v1/products/${productIdToDelete}`)
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 for an invalid product ID", async () => {
    const res = await request(global.server)
      .delete("/api/v1/products/invalid_id")
      .set("Authorization", `Bearer ${vendorAuthToken}`);

    expect(res.statusCode).toEqual(404);
  });
});
