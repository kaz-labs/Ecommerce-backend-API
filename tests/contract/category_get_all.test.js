import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import
// import { Category } from "../../src/models/Category.js"; // Removed direct import

describe("GET /categories", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Category').deleteMany({});
  });

  let adminAuthToken;

  beforeAll(async () => {
    // Register an admin user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "category_get_all_admin_telegram_id",
      username: "category_get_all_admin_user",
      role: "admin",
    });

    // Login as admin
    const adminLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "category_get_all_admin_telegram_id",
    });
    adminAuthToken = adminLoginRes.body.token;

    // Create a category
    await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: "Category 1",
      });

    await request(global.server)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        name: "Category 2",
      });
  });

  it("should return 200 and a list of categories", async () => {
    const res = await request(global.server).get("/api/v1/categories");

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("name");
  });
});
