import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("GET /products/{id}", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Category').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let productId;

  beforeAll(async () => {
    // Create admin and get token
    const adminToken = await createAdminAndGetToken();
    
    // Create vendor and get token
    const vendorAuthToken = await createVendorAndGetToken("product_get_single_vendor_telegram_id", "product_get_single_vendor_user");

    // Create a shop for the vendor
    const shopId = await createShop(vendorAuthToken, "Vendor Shop for Single Product", "A shop for testing single product retrieval");

    // Create a category
    const categoryId = await createCategory(adminToken, "Single Product Category");

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Single Test Product",
        description: "This is a single test product",
        price: 19.99,
        category: categoryId,
        shop: shopId,
      });
    productId = productRes.body.id;
  });

  it("should return 200 and the product details for a valid ID", async () => {
    const res = await request(global.server).get(`/api/v1/products/${productId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", productId);
    expect(res.body).toHaveProperty("name", "Single Test Product");
  });

  it("should return 404 for an invalid product ID", async () => {
    const res = await request(global.server).get("/api/v1/products/invalid_id");

    expect(res.statusCode).toEqual(404);
  });
});
