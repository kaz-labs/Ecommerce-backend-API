import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ShopService from '../../src/services/ShopService.js';
import { Shop } from '../../src/models/Shop.js';
import { User } from '../../src/models/User.js';

describe('ShopService', () => {
  let mongoServer;
  let vendor;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    vendor = new User({ telegramId: 'vendor123', username: 'vendor', role: 'vendor' });
    await vendor.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Shop.deleteMany({});
  });

  it('should create a new shop', async () => {
    const shopData = { name: 'Test Shop', description: 'A shop for testing', owner: vendor._id };
    const shop = await ShopService.createShop(shopData);

    expect(shop).toHaveProperty('_id');
    expect(shop.name).toBe(shopData.name);
    expect(shop.owner).toBe(vendor._id);
  });
});
