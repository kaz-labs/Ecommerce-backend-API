import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import
// import { Product } from "../../src/models/Product.js"; // Removed direct import
// import { Cart } from "../../src/models/Cart.js"; // Removed direct import

describe("GET /cart", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
    await mongoose.model('Product').deleteMany({});
    await mongoose.model('Cart').deleteMany({});
  });

  let authToken;

  beforeAll(async () => {
    // Register and login a user to get an auth token
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "cart_get_telegram_id",
      username: "cart_get_user",
    });

    const loginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "cart_get_telegram_id",
    });
    authToken = loginRes.body.token;
  });

  it("should return 200 and the current user's cart when authenticated", async () => {
    const res = await request(global.server).get("/api/v1/cart").set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("items");
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).get("/api/v1/cart");

    expect(res.statusCode).toEqual(401);
  });
});
