import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";

class CartService {
  static async getOrCreateCart(userId, shopId) {
    let cart = await Cart.findOne({ user: userId, shop: shopId }).populate('items.product');
    if (!cart) {
      cart = new Cart({ user: userId, shop: shopId, items: [] });
      await cart.save();
      await cart.populate('items.product');
    }
    return cart;
  }

  static async addItemToCart(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const shopId = product.shop;
    let cart = await this.getOrCreateCart(userId, shopId);

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString(),
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');
    return cart;
  }

  static async updateCartItem(userId, cartItemId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === cartItemId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      await cart.populate('items.product');
      return cart;
    } else {
      const error = new Error("Cart item not found");
      error.statusCode = 404;
      throw error;
    }
  }

  static async removeCartItem(userId, cartItemId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const error = new Error("Cart not found");
      error.statusCode = 404;
      throw error;
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item._id.toString() !== cartItemId);

    if (cart.items.length === initialLength) {
      const error = new Error("Cart item not found");
      error.statusCode = 404;
      throw error;
    }

    await cart.save();
    return cart;
  }

  static async getUserCart(userId) {
    // Find all carts for the user
    const carts = await Cart.find({ user: userId }).populate('items.product');
    
    // If no carts exist, return an empty cart structure
    if (!carts || carts.length === 0) {
      return {
        user: userId,
        items: [],
        id: null
      };
    }
    
    // If only one cart, return it directly
    if (carts.length === 1) {
      return carts[0];
    }
    
    // If multiple carts, merge them into one response
    const mergedItems = [];
    carts.forEach(cart => {
      mergedItems.push(...cart.items);
    });
    
    return {
      user: userId,
      items: mergedItems,
      id: carts[0]._id // Use first cart's ID
    };
  }

  static async clearCart(userId, shopId) {
    const cart = await Cart.findOne({ user: userId, shop: shopId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }
}

export default CartService;
