import { User, Customer, Vendor, Admin } from "../models/User.js";
import jwt from "jsonwebtoken";

// Placeholder for a secret key - MUST be replaced with a strong, environment-variable-based key in production
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

class UserService {
  static async registerUser({ telegramId, username, role = "customer" }) {
    // In a real app, you'd check if telegramId or username already exists
    // For now, we'll assume it's unique based on model constraints
    
    let newUser;
    switch (role) {
      case "vendor":
        newUser = new Vendor({ telegramId, username, role });
        break;
      case "admin":
        newUser = new Admin({ telegramId, username, role });
        break;
      case "customer":
      default:
        newUser = new Customer({ telegramId, username, role });
        break;
    }
    
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return { user: newUser, token };
  }

  static async findOrCreateTelegramUser({ telegramId, first_name, username }) {
    let user = await User.findOne({ telegramId });

    if (!user) {
      // Create a new customer user if not found
      user = new Customer({
        telegramId,
        username: username || first_name, // Use username if available, otherwise first_name
        role: "customer",
      });
      await user.save();
    }
    return user;
  }

  static async loginUser({ telegramId }) {
    const user = await User.findOne({ telegramId });
    if (!user) {
      throw new Error("User not found");
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    return { user, token };
  }

  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  static async updateUserProfile(userId, { username }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.username = username || user.username;
    await user.save();
    return user;
  }

  static async getAllUsers({ skip = 0, limit = 10, sort = '-createdAt' }) {
    const users = await User.find({})
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return users;
  }

  static async updateUserRole(userId, newRole) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    // This is a simplified role update. In a real app, you'd handle discriminator changes carefully.
    user.role = newRole;
    await user.save();
    return user;
  }
}

export default UserService;
