import OrderService from '../services/OrderService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class OrderController {
  static createOrder = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const orders = await OrderService.createOrderFromCart(req.user.id);
    res.status(201).json(orders);
  });

  static getAllOrders = controllerWrapper(async (req, res) => {
    const { skip, limit, sort } = req.pagination;
    // Assuming user is authenticated and user ID is available in req.user
    let orders;
    if (req.user.role === 'vendor' && req.user.shop) {
      const shopId = req.user.shop._id || req.user.shop;
      orders = await OrderService.getOrdersByShopId(shopId, { skip, limit, sort });
    } else {
      orders = await OrderService.getOrdersByUserId(req.user.id, { skip, limit, sort });
    }
    res.status(200).json(orders);
  });

  static getOrderById = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user has access to this order (owner or vendor of the shop)
    const shopId = req.user.shop?._id || req.user.shop;
    const hasAccess = order.user.toString() === req.user.id || 
                     (req.user.role === 'vendor' && order.shop.toString() === shopId) ||
                     req.user.role === 'admin';
    
    if (!hasAccess) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  });
}

export default OrderController;
