import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import
// import { Product } from "../../src/models/Product.js"; // Removed direct import
// import { Review } from "../../src/models/Review.js"; // Removed direct import
// import { Shop } from "../../src/models/Shop.js"; // Removed direct import

describe("GET /products/{id}/reviews", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Review').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let productId;

  beforeEach(async () => {
    // Register a vendor user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "review_get_all_vendor_telegram_id",
      username: "review_get_all_vendor_user",
      role: "vendor",
    });

    // Login as vendor
    const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "review_get_all_vendor_telegram_id",
    });
    const vendorAuthToken = vendorLoginRes.body.token;

    // Create a shop for the vendor
    const shopRes = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Vendor Shop for Get Reviews",
        description: "A shop for testing get reviews",
      });
    const shopId = shopRes.body.id;

    // Register an admin user and get token for category creation
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "review_get_all_admin_telegram_id",
      username: "review_get_all_admin_user",
      role: "admin",
    });
    const adminLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "review_get_all_admin_telegram_id",
    });
    const adminAuthToken = adminLoginRes.body.token;

    // Create a category
    const categoryRes = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: `Get Reviews Category - ${Date.now()}`,
      });
    const categoryId = categoryRes.body.id;

    // Create a product
    console.log("vendorAuthToken:", vendorAuthToken);
    console.log("shopId:", shopId);
    console.log("categoryId:", categoryId);
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product with Reviews",
        description: "This product will have reviews",
        price: 30.0,
        category: categoryId,
        shop: shopId,
      });
    console.log("productRes.statusCode:", productRes.statusCode);
    console.log("productRes.body:", productRes.body);
    productId = productRes.body.id;

    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "review_get_all_customer_telegram_id",
      username: "review_get_all_customer_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "review_get_all_customer_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    // Create a review for the product
    await request(global.server)
      .post(`/api/v1/products/${productId}/reviews`)
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        rating: 4,
        comment: "Good product!",
      });
  });

  it("should return 200 and a list of reviews for a valid product ID", async () => {
    const res = await request(global.server).get(`/api/v1/products/${productId}/reviews`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("rating", 4);
  });

  it("should return 404 for an invalid product ID", async () => {
    const res = await request(global.server).get("/api/v1/products/invalid_id/reviews");

    expect(res.statusCode).toEqual(404);
  });
});
