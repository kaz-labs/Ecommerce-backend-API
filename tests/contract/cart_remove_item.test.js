import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("DELETE /cart/items/{itemId}", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  let authToken;
  let productId;
  let cartItemId;

  beforeAll(async () => {
    // Register and login a user to get an auth token
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "cart_remove_telegram_id",
      username: "cart_remove_user",
    });

    const loginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "cart_remove_telegram_id",
    });
    authToken = loginRes.body.token;

    // Create admin and get token
    const adminToken = await createAdminAndGetToken();
    
    // Create vendor and get token
    const vendorAuthToken = await createVendorAndGetToken("cart_remove_vendor_telegram_id", "cart_remove_vendor_user");

    // Create a shop for the vendor
    const shopId = await createShop(vendorAuthToken, "Vendor Shop for Cart Remove", "A shop for testing cart remove");

    // Create a category
    const categoryId = await createCategory(adminToken, "Cart Remove Category");

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product for Cart Remove",
        description: "This product will be removed from cart",
        price: 25.0,
        category: categoryId,
        shop: shopId,
      });
    productId = productRes.body.id;

    // Add item to cart
    const cartRes = await request(global.server)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        productId: productId,
        quantity: 1,
      });
    cartItemId = cartRes.body.items[0].id; // Assuming cart item has an ID
  });

  it("should return 204 on successful cart item removal when authenticated", async () => {
    const res = await request(global.server)
      .delete(`/api/v1/cart/items/${cartItemId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(204);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).delete(`/api/v1/cart/items/${cartItemId}`);

    expect(res.statusCode).toEqual(401);
  });

  it("should return 404 for an invalid cart item ID", async () => {
    const res = await request(global.server)
      .delete("/api/v1/cart/items/invalid_id")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(404);
  });
});
