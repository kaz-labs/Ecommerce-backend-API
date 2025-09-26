import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("GET /users (Admin only)", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
  });

  let adminAuthToken;
  let customerAuthToken;

  beforeAll(async () => {
    adminAuthToken = await createAdminAndGetToken();

    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "customer_get_users_telegram_id",
      username: "customer_get_users_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "customer_get_users_telegram_id",
    });
    customerAuthToken = customerLoginRes.body.token;
  });

  it("should return 200 and a list of users when authenticated as admin", async () => {
    const res = await request(global.server)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${adminAuthToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("username");
    expect(res.body[0]).toHaveProperty("role");
  });

  it("should return 403 when authenticated as a non-admin user", async () => {
    const res = await request(global.server)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(res.statusCode).toEqual(403);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).get("/api/v1/admin/users");

    expect(res.statusCode).toEqual(401);
  });
});
