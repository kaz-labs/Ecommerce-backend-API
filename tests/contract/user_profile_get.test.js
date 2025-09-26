import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import

describe("GET /users/me", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
  });

  let authToken;

  beforeEach(async () => {
    // Register and login a user to get an auth token
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "profile_test_telegram_id",
      username: "profile_test_user",
    });

    const loginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "profile_test_telegram_id",
    });
    authToken = loginRes.body.token;
  });

  it(`should return 200 and the current user's profile when authenticated`, async () => {
    const res = await request(global.server)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "profile_test_user");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).get("/api/v1/users/me");

    expect(res.statusCode).toEqual(401);
  });
});
