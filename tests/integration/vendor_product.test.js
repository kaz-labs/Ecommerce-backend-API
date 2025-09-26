import supertest from "supertest";
const request = supertest;
import app from "../../../backend/src/app.js"; // Assuming app.js will be in backend/src and use .js extension for ESM

describe("Vendor Product Creation Integration Flow", () => {
  let vendorAuthToken;
  let shopId;
  let categoryId;

  beforeAll(async () => {
    // 1. Register a vendor user
    await request(app).post("/api/v1/users/register").send({
      telegramId: "integration_vendor_product_telegram_id",
      username: "integration_vendor_product_user",
    });

    // 2. Log in as vendor
    const loginRes = await request(app).post("/api/v1/users/login").send({
      telegramId: "integration_vendor_product_telegram_id",
    });
    vendorAuthToken = loginRes.body.token;

    // 3. Create a shop for the vendor
    const shopRes = await request(app)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Integration Vendor Shop",
        description: "Shop for product integration tests",
      });
    shopId = shopRes.body.id;

    // 4. Create a category
    const categoryRes = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Integration Category",
      });
    categoryId = categoryRes.body.id;
  });

  it("should allow a vendor to create a product in their shop", async () => {
    // 5. Create a product
    const productRes = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Integration Product",
        description: "A product for integration testing",
        price: 50.0,
        category: categoryId,
        shop: shopId,
      });

    expect(productRes.statusCode).toEqual(201);
    expect(productRes.body).toHaveProperty("name", "Integration Product");
    expect(productRes.body).toHaveProperty("shop", shopId);

    // 6. Verify product can be viewed by a customer (unauthenticated)
    const getProductRes = await request(app).get(`/api/v1/products/${productRes.body.id}`);

    expect(getProductRes.statusCode).toEqual(200);
    expect(getProductRes.body).toHaveProperty("name", "Integration Product");
  });
});
