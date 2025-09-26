import CartService from '../services/CartService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class CartController {
  static getCart = controllerWrapper(async (req, res) => {
    // Get user's current cart (assuming one cart per user for now)
    const cart = await CartService.getUserCart(req.user.id);
    res.status(200).json(cart);
  });

  static addItemToCart = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const { productId, quantity } = req.body;
    const cart = await CartService.addItemToCart(req.user.id, productId, quantity);
    res.status(200).json(cart);
  });

  static updateCartItem = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await CartService.updateCartItem(req.user.id, itemId, quantity);
    res.status(200).json(cart);
  });

  static removeItemFromCart = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const { itemId } = req.params;
    await CartService.removeCartItem(req.user.id, itemId);
    res.status(204).send();
  });
}

export default CartController;
