import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import OrderService from '../../src/services/OrderService.js';
import { Order } from '../../src/models/Order.js';
import { User } from '../../src/models/User.js';
import { Cart } from '../../src/models/Cart.js';
import { Product } from '../../src/models/Product.js';

describe('OrderService', () => {
  let mongoServer;
  let user;
  let product;
  let cart;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    user = new User({ telegramId: 'user123', username: 'user', role: 'customer' });
    await user.save();

    product = new Product({ name: 'Test Product', price: 100, shop: new mongoose.Types.ObjectId() });
    await product.save();

    cart = new Cart({ user: user._id, items: [{ product: product._id, quantity: 2 }] });
    await cart.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Order.deleteMany({});
  });

  it('should create an order from the cart', async () => {
    const order = await OrderService.createOrder(user._id);

    expect(order).toBeDefined();
    expect(order.user).toEqual(user._id);
    expect(order.items.length).toBe(1);
    expect(order.items[0].product).toEqual(product._id);
    expect(order.totalAmount).toBe(200);
  });
});
