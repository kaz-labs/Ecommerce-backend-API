import supertest from "supertest";
const request = supertest;
import app from "../../../backend/src/app.js"; // Assuming app.js will be in backend/src and use .js extension for ESM

describe("Customer Cart & Order Placement Integration Flow", () => {
  let customerAuthToken;
  let vendorAuthToken;
  let productId;
  let shopId;

  beforeAll(async () => {
    // 1. Register a customer user
    await request(app).post("/api/v1/users/register").send({
      telegramId: "integration_customer_order_telegram_id",
      username: "integration_customer_order_user",
    });

    // 2. Log in as customer
    const customerLoginRes = await request(app).post("/api/v1/users/login").send({
      telegramId: "integration_customer_order_telegram_id",
    });
    customerAuthToken = customerLoginRes.body.token;

    // 3. Register a vendor user
    await request(app).post("/api/v1/users/register").send({
      telegramId: "integration_customer_order_vendor_telegram_id",
      username: "integration_customer_order_vendor_user",
    });

    // 4. Log in as vendor
    const vendorLoginRes = await request(app).post("/api/v1/users/login").send({
      telegramId: "integration_customer_order_vendor_telegram_id",
    });
    vendorAuthToken = vendorLoginRes.body.token;

    // 5. Create a shop for the vendor
    const shopRes = await request(app)
      .post("/api/v1/shops")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Integration Order Shop",
        description: "Shop for order integration tests",
      });
    shopId = shopRes.body.id;

    // 6. Create a category
    const categoryRes = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Integration Order Category",
      });
    const categoryId = categoryRes.body.id;

    // 7. Create a product
    const productRes = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${vendorAuthToken}`)
      .send({
        name: "Integration Order Product",
        description: "A product for order integration testing",
        price: 60.0,
        category: categoryId,
        shop: shopId,
      });
    productId = productRes.body.id;
  });

  it("should allow a customer to add a product to cart, place an order, and view order history", async () => {
    // 8. Add product to customer's cart
    await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${customerAuthToken}`)
      .send({
        productId: productId,
        quantity: 1,
      });

    // 9. Place an order
    const orderRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(orderRes.statusCode).toEqual(201);
    expect(orderRes.body).toHaveProperty("status", "pending");

    // 10. View order history
    const orderHistoryRes = await request(app)
      .get("/api/v1/orders")
      .set("Authorization", `Bearer ${customerAuthToken}`);

    expect(orderHistoryRes.statusCode).toEqual(200);
    expect(Array.isArray(orderHistoryRes.body)).toBe(true);
    expect(orderHistoryRes.body.length).toBeGreaterThan(0);
    expect(orderHistoryRes.body[0]).toHaveProperty("id", orderRes.body.id);
  });
});
