import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import
// import { Product } from "../../src/models/Product.js"; // Removed direct import
// import { Review } from "../../src/models/Review.js"; // Removed direct import
// import { Shop } from "../../src/models/Shop.js"; // Removed direct import

describe("POST /products/{id}/reviews", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Review').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let customerAuthToken;
  let vendorAuthToken;
  let productId;

  beforeAll(async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "review_create_customer_telegram_id",
      username: "review_create_customer_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "review_create_customer_telegram_id",
    });
    customerAuthToken = customerLoginRes.body.token;

    // Register a vendor user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "review_create_vendor_telegram_id",
      username: "review_create_vendor_user",
      role: "vendor",
    });

    // Login as vendor
    const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "review_create_vendor_telegram_id",
    });
    vendorAuthToken = vendorLoginRes.body.token;

    // Create a shop for the vendor
    const shopRes = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Vendor Shop for Review",
        description: "A shop for testing review creation",
      });
    const shopId = shopRes.body.id;

    // Register an admin user and get token for category creation
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "review_create_admin_telegram_id",
      username: "review_create_admin_user",
      role: "admin",
    });
    const adminLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "review_create_admin_telegram_id",
    });
    const adminAuthToken = adminLoginRes.body.token;

    // Create a category
    const categoryRes = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: "Review Category",
      });
    const categoryId = categoryRes.body.id;

    // Create a product to review
    const productRes = await request(global.server)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Product to Review",
        description: "This product will receive a review",
        price: 25.0,
        category: categoryId,
        shop: shopId,
      });
    productId = productRes.body.id;
  });

  it("should return 201 and the new review when authenticated as a customer", async () => {
    const res = await request(global.server)
      .post(`/api/v1/products/${productId}/reviews`)
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        rating: 5,
        comment: "Excellent product!",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("rating", 5);
    expect(res.body).toHaveProperty("comment", "Excellent product!");
    expect(res.body).toHaveProperty("product", productId);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).post(`/api/v1/products/${productId}/reviews`).send({
      rating: 1,
      comment: "Bad product!",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 404 for an invalid product ID", async () => {
    const res = await request(global.server)
      .post("/api/v1/products/invalid_id/reviews")
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        rating: 3,
        comment: "Product not found",
      });

    expect(res.statusCode).toEqual(404);
  });
});
