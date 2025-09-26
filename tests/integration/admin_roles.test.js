import supertest from "supertest";
const request = supertest;
import app from "../../../backend/src/app.js"; // Assuming app.js will be in backend/src and use .js extension for ESM

describe("Administrator Role Management Integration Flow", () => {
  let adminAuthToken;
  let customerId;

  beforeAll(async () => {
    // 1. Register an admin user
    await request(app).post("/api/v1/users/register").send({
      telegramId: "integration_admin_roles_admin_telegram_id",
      username: "integration_admin_roles_admin_user",
    });

    // 2. Log in as admin
    const adminLoginRes = await request(app).post("/api/v1/users/login").send({
      telegramId: "integration_admin_roles_admin_telegram_id",
    });
    adminAuthToken = adminLoginRes.body.token;

    // 3. Register a customer user to update their role
    const customerRes = await request(app).post("/api/v1/users/register").send({
      telegramId: "integration_admin_roles_customer_telegram_id",
      username: "integration_admin_roles_customer_user",
    });
    customerId = customerRes.body.user.id;
  });

  it("should allow an admin to change a user's role", async () => {
    // 4. Admin changes customer's role to vendor
    const updateRoleRes = await request(app)
      .patch(`/api/v1/users/${customerId}/role`)
      .set("Authorization", `Bearer ${adminAuthToken}`)
      .send({
        role: "vendor",
      });

    expect(updateRoleRes.statusCode).toEqual(200);
    expect(updateRoleRes.body.user).toHaveProperty("role", "vendor");

    // 5. Verify the role change by logging in as the updated user and checking their profile
    const loginRes = await request(app).post("/api/v1/users/login").send({
      telegramId: "integration_admin_roles_customer_telegram_id",
    });
    const updatedUserAuthToken = loginRes.body.token;

    const profileRes = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${updatedUserAuthToken}`);

    expect(profileRes.statusCode).toEqual(200);
    expect(profileRes.body.user).toHaveProperty("role", "vendor");
  });
});
