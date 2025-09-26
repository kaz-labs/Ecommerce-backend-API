import mongoose from "mongoose";
import supertest from "supertest";
const request = supertest;

// import { User } from "../src/models/User.js"; // Removed direct import

describe("POST /users/register", () => {
  afterEach(async () => {
    await mongoose.model('User').deleteMany({});
  });

  it("should return 201 and the new user on successful registration", async () => {
    const res = await request(global.server).post("/api/v1/users/register").send({
      telegramId: "test_telegram_id_1",
      username: "testuser1",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("username", "testuser1");
    expect(res.body.user).toHaveProperty("role", "customer");
  });

  it("should return 409 if username or telegramId already exists", async () => {
    // First registration
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "duplicate_telegram_id",
      username: "duplicateuser",
    });

    // Attempt duplicate registration
    const res = await request(global.server).post("/api/v1/users/register").send({
      telegramId: "duplicate_telegram_id",
      username: "anotherduplicateuser",
    });

    expect(res.statusCode).toEqual(409);
  });
});
