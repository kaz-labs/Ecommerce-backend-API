import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ProductService from '../../src/services/ProductService.js';
import { Product } from '../../src/models/Product.js';
import { User } from '../../src/models/User.js';

describe('ProductService', () => {
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
    await Product.deleteMany({});
  });

  it('should create a new product', async () => {
    const productData = { name: 'Test Product', description: 'A product for testing', price: 100, shop: new mongoose.Types.ObjectId() };
    const product = await ProductService.createProduct(productData);

    expect(product).toHaveProperty('_id');
    expect(product.name).toBe(productData.name);
    expect(product.price).toBe(productData.price);
  });
});
