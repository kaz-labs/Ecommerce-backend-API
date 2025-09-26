import supertest from "supertest";
const request = supertest;

export const createAdminAndGetToken = async () => {
  await request(global.server).post("/api/v1/users/register").send({
    telegramId: "admin_test_telegram_id",
    username: "admin_test_user",
    role: "admin",
  });

  const adminLoginRes = await request(global.server).post("/api/v1/users/login").send({
    telegramId: "admin_test_telegram_id",
  });
  return adminLoginRes.body.token;
};

export const createCategory = async (adminToken, categoryName) => {
  const categoryRes = await request(global.server)
    .post("/api/v1/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: categoryName,
    });
  return categoryRes.body.id;
};

export const createVendorAndGetToken = async (telegramId, username) => {
  await request(global.server).post("/api/v1/users/register").send({
    telegramId: telegramId,
    username: username,
    role: "vendor",
  });

  const vendorLoginRes = await request(global.server).post("/api/v1/users/login").send({
    telegramId: telegramId,
  });
  return vendorLoginRes.body.token;
};

export const createShop = async (vendorToken, shopName, shopDescription) => {
  const shopRes = await request(global.server)
    .post("/api/v1/shops")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      name: shopName,
      description: shopDescription,
    });
  return shopRes.body.id;
};
