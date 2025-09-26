import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import CartService from '../../src/services/CartService.js';
import { Cart } from '../../src/models/Cart.js';
import { User } from '../../src/models/User.js';
import { Product } from '../../src/models/Product.js';

describe('CartService', () => {
  let mongoServer;
  let user;
  let product;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    user = new User({ telegramId: 'user123', username: 'user', role: 'customer' });
    await user.save();

    product = new Product({ name: 'Test Product', price: 100, shop: new mongoose.Types.ObjectId() });
    await product.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Cart.deleteMany({});
  });

  it('should add an item to the cart', async () => {
    const cart = await CartService.addItemToCart(user._id, product._id, 2);

    expect(cart).toBeDefined();
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].product).toEqual(product._id);
    expect(cart.items[0].quantity).toBe(2);
  });
});
