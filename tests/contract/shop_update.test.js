import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { User } from "../../src/models/User.js";
import { createVendorAndGetToken } from "../testUtils.js";

describe("PATCH /shops/{id}", () => {
  afterEach(async () => {
    await User.deleteMany({});
    await mongoose.model('Shop').deleteMany({}); // Use mongoose.model
  });

  let vendorAuthToken;
  let shopIdToUpdate;

  beforeAll(async () => {
    vendorAuthToken = await createVendorAndGetToken(
      "shop_update_vendor_telegram_id",
      "shop_update_vendor_user"
    );

    // Create a shop to update
    const shopRes = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Shop to Update",
        description: "This shop will be updated",
      });
    shopIdToUpdate = shopRes.body.id;
  });

  it("should return 200 and the updated shop details when authenticated as vendor", async () => {
    const res = await request(global.server)
      .patch(`/api/v1/shops/${shopIdToUpdate}`)
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Updated Shop Name",
        description: "Updated description",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", shopIdToUpdate);
    expect(res.body).toHaveProperty("name", "Updated Shop Name");
    expect(res.body).toHaveProperty("description", "Updated description");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).patch(`/api/v1/shops/${shopIdToUpdate}`).send({
      name: "Unauthorized Update",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 403 if authenticated as a non-vendor user", async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "customer_shop_update_telegram_id",
      username: "customer_shop_update_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "customer_shop_update_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    const res = await request(global.server)
      .patch(`/api/v1/shops/${shopIdToUpdate}`)
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        name: "Customer Attempt Update",
      });

    expect(res.statusCode).toEqual(403);
  });

  it("should return 404 for an invalid shop ID", async () => {
    const res = await request(global.server)
      .patch("/api/v1/shops/invalid_id")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Non Existent Shop",
      });

    expect(res.statusCode).toEqual(404);
  });
});
