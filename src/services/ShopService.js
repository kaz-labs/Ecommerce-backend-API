import Shop from "../models/Shop.js";
import { User, Vendor } from "../models/User.js";
import mongoose from "mongoose";

class ShopService {
  static async createShop({ name, description, vendorId }) {
    // Check if vendor already has a shop
    const existingShop = await Shop.findOne({ vendor: vendorId });
    if (existingShop) {
      throw new Error("Vendor already has a shop");
    }

    const newShop = new Shop({ name, description, vendor: vendorId });
    await newShop.save();

    // Update the vendor's user record to link to this shop
    await Vendor.findByIdAndUpdate(vendorId, { shop: newShop._id });

    return newShop;
  }

  static async getShopById(shopId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return null;
    }
    
    const shop = await Shop.findById(shopId).populate("vendor");
    return shop; // Return null if not found, let controller handle 404
  }

  static async updateShop(shopId, { name, description }) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return null;
    }
    
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return null; // Return null if not found, let controller handle 404
    }
    shop.name = name || shop.name;
    shop.description = description || shop.description;
    await shop.save();
    return shop;
  }
}

export default ShopService;
