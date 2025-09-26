import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createCategory, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("PATCH /cart/items/{itemId}", () => {
  let authToken;
  let productId;
  let cartItemId;
  let customerUser;
  let vendorUser;
  let shopId;
  let categoryId;

  beforeAll(async () => {
    // Register and login a customer user to get an auth token
    const customerRes = await request(global.server).post("/api/v1/users/register").send({
      telegramId: "cart_update_customer_telegram_id",
      username: "cart_update_customer_user",
    });
    customerUser = customerRes.body.user;
    authToken = customerRes.body.token;

    // Create admin and get token
    const adminToken = await createAdminAndGetToken();
    
    // Create vendor and get token
    const vendorAuthToken = await createVendorAndGetToken("cart_update_vendor_telegram_id", "cart_update_vendor_user");

    // Create a shop for the vendor
    shopId = await createShop(vendorAuthToken, "Vendor Shop for Cart Update", "A shop for testing cart update");

    // Create a category
    categoryId = await createCategory(adminToken, "Cart Update Category");

    // Create a product
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product for Cart Update",
        description: "This product will be updated in cart",
        price: 30.0,
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
    cartItemId = cartRes.body.items[0].id;
  });

  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  it("should return 200 and the updated cart item when authenticated", async () => {
    const res = await request(global.server)
      .patch(`/api/v1/cart/items/${cartItemId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 2,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.items[0].product.id).toEqual(productId);
    expect(res.body.items[0]).toHaveProperty("quantity", 2);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server)
      .patch(`/api/v1/cart/items/${cartItemId}`)
      .send({
        quantity: 3,
      });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 404 for an invalid cart item ID", async () => {
    const res = await request(global.server)
      .patch("/api/v1/cart/items/invalid_id")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        quantity: 3,
      });

    expect(res.statusCode).toEqual(404);
  });
});