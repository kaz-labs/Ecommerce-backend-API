import supertest from "supertest";
const request = supertest;
import app from "../../../backend/src/app.js"; // Assuming app.js will be in backend/src and use .js extension for ESM

describe("User Registration & Login Integration Flow", () => {
  it("should allow a new user to register and then log in", async () => {
    const telegramId = "integration_user_auth_telegram_id";
    const username = "integration_user_auth_user";

    // 1. Register user
    const registerRes = await request(app).post("/api/v1/users/register").send({
      telegramId,
      username,
    });

    expect(registerRes.statusCode).toEqual(201);
    expect(registerRes.body).toHaveProperty("token");
    expect(registerRes.body.user).toHaveProperty("username", username);

    // 2. Log in with the registered user
    const loginRes = await request(app).post("/api/v1/users/login").send({
      telegramId,
    });

    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body).toHaveProperty("token");
    expect(loginRes.body.user).toHaveProperty("username", username);
  });

  it("should prevent registration with duplicate telegramId or username", async () => {
    const telegramId = "duplicate_integration_telegram_id";
    const username = "duplicate_integration_user";

    // First registration
    await request(app).post("/api/v1/users/register").send({
      telegramId,
      username,
    });

    // Attempt duplicate telegramId
    const duplicateTelegramIdRes = await request(app).post("/api/v1/users/register").send({
      telegramId,
      username: "another_user",
    });
    expect(duplicateTelegramIdRes.statusCode).toEqual(409);

    // Attempt duplicate username
    const duplicateUsernameRes = await request(app).post("/api/v1/users/register").send({
      telegramId: "another_telegram_id",
      username,
    });
    expect(duplicateUsernameRes.statusCode).toEqual(409);
  });
});
