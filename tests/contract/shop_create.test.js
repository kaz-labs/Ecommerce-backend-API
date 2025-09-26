import supertest from "supertest";
const request = supertest;

import { User } from "../../src/models/User.js";
import Shop from "../../src/models/Shop.js";

describe("POST /shops", () => {
  afterEach(async () => {
    await User.deleteMany({});
    await Shop.deleteMany({});
  });

  let vendorAuthToken;

  beforeAll(async () => {
    // Register a vendor user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "shop_create_vendor_telegram_id",
      username: "shop_create_vendor_user",
      role: "vendor",
    });

    // Login as vendor
    const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "shop_create_vendor_telegram_id",
    });
    vendorAuthToken = vendorLoginRes.body.token;
  });

  it("should return 201 and the new shop when authenticated as a vendor", async () => {
    const res = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "My Test Shop",
        description: "A shop created for testing",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", "My Test Shop");
    expect(res.body).toHaveProperty("description", "A shop created for testing");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).post("/api/v1/shops").send({
      name: "Unauthorized Shop",
      description: "Should not be created",
    });

    expect(res.statusCode).toEqual(401);
  });

  it("should return 403 if authenticated as a non-vendor user", async () => {
    // Register a customer user
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "shop_create_customer_telegram_id",
      username: "shop_create_customer_user",
    });

    // Login as customer
    const customerLoginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "shop_create_customer_telegram_id",
    });
    const customerAuthToken = customerLoginRes.body.token;

    const res = await request(global.server)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        name: "Customer Shop",
        description: "Should not be created by customer",
      });

    expect(res.statusCode).toEqual(403);
  });
});
