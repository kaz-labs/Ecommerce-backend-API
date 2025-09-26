import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createAdminAndGetToken, createVendorAndGetToken, createShop } from "../testUtils.js";

describe("PATCH /users/{id}/role (Admin only)", () => {
  afterAll(async () => {
    await mongoose.model('User').deleteMany({});
  });

  let adminAuthToken;
  let customerId;

  beforeAll(async () => {
    adminAuthToken = await createAdminAndGetToken();

    // Register a customer user to update their role
    const customerRes = await request(global.server).post("/api/v1/users/register").send({
      telegramId: "customer_to_update_telegram_id",
      username: "customer_to_update_user",
    });
    customerId = customerRes.body.user.id;
  });

  it("should return 200 and the updated user with new role when authenticated as admin", async () => {
    const res = await request(global.server)
                .patch(`/api/v1/admin/users/${customerId}/role`)
                .set("Authorization", `Bearer ${adminAuthToken}`)      .send({
        role: "vendor",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id", customerId);
    expect(res.body.user).toHaveProperty("role", "vendor");
  });

  it("should return 403 when authenticated as a non-admin user", async () => {
    // Login as a non-admin user (e.g., the customer whose role we want to change)
    const nonAdminLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "customer_to_update_telegram_id",
    });
    const nonAdminAuthToken = nonAdminLoginRes.body.token;

    const res = await request(global.server)
      .patch(`/api/v1/admin/users/${customerId}/role`)
      .set("Authorization", `Bearer ${nonAdminAuthToken}`)
      .send({
        role: "admin",
      });

    expect(res.statusCode).toEqual(403);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).patch(`/api/v1/admin/users/${customerId}/role`).send({
      role: "admin",
    });

    expect(res.statusCode).toEqual(401);
  });
});
