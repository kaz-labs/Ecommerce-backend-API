import ShopService from '../services/ShopService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class ShopController {
  static createShop = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const shop = await ShopService.createShop({ ...req.body, vendorId: req.user.id });
    res.status(201).json(shop);
  });

  static getShopById = controllerWrapper(async (req, res) => {
    const { id } = req.params;
    const shop = await ShopService.getShopById(id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  });

  static updateShop = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and is the owner of the shop
    const { id } = req.params;
    const shop = await ShopService.updateShop(id, req.body);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.status(200).json(shop);
  });
}

export default ShopController;
