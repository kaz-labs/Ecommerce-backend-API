import Order from "../models/Order.js";
import CartService from "./CartService.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";

class OrderService {
  static async createOrderFromCart(userId) {
    console.log(`createOrderFromCart called for userId: ${userId}`);
    const carts = await Cart.find({ user: userId });
    console.log(`Found carts for user ${userId}:`, carts);
    if (!carts || carts.length === 0) {
      const error = new Error("No carts found for the user");
      error.statusCode = 400;
      throw error;
    }

    const createdOrders = [];

    for (const cart of carts) {
      console.log(`Processing cart:`, cart);
      if (cart.items.length === 0) {
        console.log(`Skipping empty cart:`, cart._id);
        continue;
      }

      const orderItems = await Promise.all(
        cart.items.map(async (cartItem) => {
          const product = await Product.findById(cartItem.product);
          if (!product) {
            throw new Error(`Product with ID ${cartItem.product} not found`);
          }
          return {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
          };
        }),
      );

      const newOrder = new Order({
        user: userId,
        shop: cart.shop,
        items: orderItems,
        status: "pending",
      });

      await newOrder.save();
      await CartService.clearCart(userId, cart.shop); // Clear the specific cart after order is placed
      createdOrders.push(newOrder);
    }

    if (createdOrders.length === 0) {
      const error = new Error("No orders could be created from the carts");
      error.statusCode = 400;
      throw error;
    }

    return createdOrders;
  }

  static async getOrdersByUserId(userId, { skip = 0, limit = 10, sort = '-createdAt' }) {
    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return orders;
  }

  static async getOrdersByShopId(shopId, { skip = 0, limit = 10, sort = '-createdAt' }) {
    const orders = await Order.find({ shop: shopId })
      .populate("items.product")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return orders;
  }

  static async getOrderById(orderId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    
    const order = await Order.findById(orderId).populate("items.product");
    return order; // Return null if not found, let controller handle 404
  }
}

export default OrderService;
