import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("POST /cart", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  let authToken;
  let productId;

  beforeAll(async () => {
    // Register and login a user to get an auth token
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "cart_add_telegram_id",
      username: "cart_add_user",
    });

    const loginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "cart_add_telegram_id",
    });
    authToken = loginRes.body.token;

    // Create admin and get token
    const adminToken = await createAdminAndGetToken();
    
    // Create vendor and get token
    const vendorAuthToken = await createVendorAndGetToken("cart_add_vendor_telegram_id", "cart_add_vendor_user");

    // Create a shop for the vendor
    const shopId = await createShop(vendorAuthToken, "Vendor Shop for Cart Add", "A shop for testing cart add");

    // Create a category
    const categoryId = await createCategory(adminToken, "Cart Add Category");

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product for Cart",
        description: "This product will be added to cart",
        price: 15.0,
        category: categoryId,
        shop: shopId,
      });
    productId = productRes.body.id;
  });

  it("should return 200 and the updated cart when authenticated", async () => {
    const res = await request(global.server)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        productId: productId,
        quantity: 1,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.items[0]).toHaveProperty("product");
    expect(res.body.items[0].product).toHaveProperty("id", productId);
    expect(res.body.items[0]).toHaveProperty("quantity", 1);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).post("/api/v1/cart").send({
      productId: productId,
      quantity: 1,
    });

    expect(res.statusCode).toEqual(401);
  });
});
