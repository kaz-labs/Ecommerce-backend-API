import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserService from '../../src/services/UserService.js';
import { User } from '../../src/models/User.js';

describe('UserService', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const userData = { telegramId: '12345', username: 'testuser' };
    const { user, token } = await UserService.registerUser(userData);

    expect(user).toHaveProperty('_id');
    expect(user.telegramId).toBe(userData.telegramId);
    expect(user.username).toBe(userData.username);
    expect(token).toBeDefined();
  });

  it('should not register a user that already exists', async () => {
    const userData = { telegramId: '12345', username: 'testuser' };
    await UserService.registerUser(userData);

    await expect(UserService.registerUser(userData)).rejects.toThrow('User already exists');
  });

  it('should login an existing user', async () => {
    const userData = { telegramId: '12345', username: 'testuser' };
    await UserService.registerUser(userData);

    const { user, token } = await UserService.loginUser({ telegramId: userData.telegramId });

    expect(user).toBeDefined();
    expect(token).toBeDefined();
  });

  it('should not login a non-existent user', async () => {
    await expect(UserService.loginUser({ telegramId: 'nonexistent' })).rejects.toThrow('User not found');
  });
});
