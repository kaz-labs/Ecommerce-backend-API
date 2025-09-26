import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import
// import { Category } from "../../src/models/Category.js"; // Removed direct import

describe("POST /categories", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  let adminAuthToken;

  beforeAll(async () => {
    // Register an admin user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "category_create_admin_telegram_id",
      username: "category_create_admin_user",
      role: "admin",
    });

    // Login as admin (assuming a way to elevate role later, for now just login)
    const adminLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "category_create_admin_telegram_id",
    });
    adminAuthToken = adminLoginRes.body.token;
  });

  it("should return 201 and the new category when authenticated as admin", async () => {
    const res = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: "New Category",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "New Category");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).post("/api/v1/categories").send({
      name: "Unauthorized Category",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 403 if authenticated as a non-admin user", async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "category_create_customer_telegram_id",
      username: "category_create_customer_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "category_create_customer_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    const res = await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        name: "Customer Category",
      });

    expect(res.statusCode).toEqual(403);
  });
});
