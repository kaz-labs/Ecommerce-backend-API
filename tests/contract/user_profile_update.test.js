import supertest from "supertest";
const request = supertest;

import { User } from "../../src/models/User.js";

describe("PATCH /users/me", () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  let authToken;

  beforeEach(async () => {
    // Register and login a user to get an auth token
    await request(global.server).post("/api/v1/users/register").send({
      telegramId: "update_profile_test_telegram_id",
      username: "update_profile_test_user",
    });

    const loginRes = await request(global.server).post("/api/v1/users/login").send({
      telegramId: "update_profile_test_telegram_id",
    });
    authToken = loginRes.body.token;
  });

  it(`should return 200 and the updated user's profile when authenticated`, async () => {
    const res = await request(global.server)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        username: "updated_profile_test_user",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "updated_profile_test_user");
  });

  it("should return 401 if not authenticated", async () => {
    const res = await request(global.server).patch("/api/v1/users/me").send({
      username: "unauthenticated_update",
    });

    expect(res.statusCode).toEqual(401);
  });
});
