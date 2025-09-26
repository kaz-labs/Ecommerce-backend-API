import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../../src/models/User.js"; // Removed direct import

describe("POST /users/login", () => {
  beforeEach(async () => {
    await mongoose.model('User').deleteMany({});
  });

  it("should return 200 and a token on successful login", async () => {
    // First, register a user to be able to log in
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "login_test_telegram_id",
      username: "login_test_user",
    });

    const res = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "login_test_telegram_id",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("_id"); // Changed to _id
    expect(res.body.user).toHaveProperty("username", "login_test_user");
    expect(res.body.user).toHaveProperty("role", "customer");
  });

  it("should return 500 for an unregistered telegramId", async () => {
    const res = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "unregistered_telegram_id",
    });

    expect(res.statusCode).toEqual(500);
  });
});
