import supertest from "supertest";
const request = supertest;

import Product from "../../src/models/Product.js";
import Category from "../../src/models/Category.js"; // Import Category model
import Shop from "../../src/models/Shop.js";       // Import Shop model
import { User } from "../../src/models/User.js";       // Import User model

describe("GET /products", () => {
  let categoryId1, categoryId2, shopId1, shopId2, vendorUser1, vendorUser2;

  afterEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({}); // Clean up categories
    await Shop.deleteMany({});     // Clean up shops
    await User.deleteMany({});      // Clean up users
  });

  beforeAll(async () => {
    vendorUser1 = await User.create({ telegramId: "vendor1", username: "vendor_user1", role: "vendor" });
    vendorUser2 = await User.create({ telegramId: "vendor2", username: "vendor_user2", role: "vendor" });

    const category1 = await Category.create({ name: "Electronics" });
    const category2 = await Category.create({ name: "Books" });
    categoryId1 = category1._id;
    categoryId2 = category2._id;

    const shop1 = await Shop.create({ name: "Shop 1", description: "Shop 1 Description", vendor: vendorUser1._id });
    const shop2 = await Shop.create({ name: "Shop 2", description: "Shop 2 Description", vendor: vendorUser2._id });
    shopId1 = shop1._id;
    shopId2 = shop2._id;

    await Product.create({ name: "Product 1", description: "Desc 1", price: 10, category: categoryId1, shop: shopId1 });
    await Product.create({ name: "Product 2", description: "Desc 2", price: 20, category: categoryId2, shop: shopId2 });
  });

  it("should return 200 and a list of products", async () => {
    const res = await request(global.server).get("/api/v1/products");

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});