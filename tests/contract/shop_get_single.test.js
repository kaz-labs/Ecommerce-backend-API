import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

import { createVendorAndGetToken, createShop } from "../testUtils.js";

describe("GET /shops/{id}", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Shop').deleteMany({});
  });

  let shopId;

  beforeAll(async () => {
    // Create vendor and get token
    const vendorAuthToken = await createVendorAndGetToken("shop_get_single_vendor_telegram_id", "shop_get_single_vendor_user");

    // Create a shop
    shopId = await createShop(vendorAuthToken, "Shop for Single Get", "A shop for testing single shop retrieval");
  });

  it("should return 200 and the shop details for a valid ID", async () => {
    const res = await request(global.server).get(`/api/v1/shops/${shopId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", shopId);
    expect(res.body).toHaveProperty("name", "Shop for Single Get");
  });

  it("should return 404 for an invalid shop ID", async () => {
    const res = await request(global.server).get("/api/v1/shops/invalid_id");

    expect(res.statusCode).toEqual(404);
  });
});
