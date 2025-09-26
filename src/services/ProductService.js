import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";

class ProductService {
  static async createProduct({ name, description, price, category, shop }) {
    const newProduct = new Product({ name, description, price, category, shop });
    await newProduct.save();
    return newProduct;
  }

  static async getAllProducts({ skip = 0, limit = 10, sort = '-createdAt' }) {
    const products = await Product.find({})
      .populate("category")
      .populate("shop")
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return products;
  }

  static async getProductById(productId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }
    
    const product = await Product.findById(productId).populate("category").populate("shop");
    return product; // Return null if not found, let controller handle 404
  }

  static async updateProduct(productId, { name, description, price, category }) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return null; // Return null if not found, let controller handle 404
    }
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    await product.save();
    return product;
  }

  static async deleteProduct(productId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }
    
    const product = await Product.findByIdAndDelete(productId);
    return product; // Return null if not found, let controller handle 404
  }

  static async addReviewToProduct(productId, userId, { rating, comment }) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    const newReview = new Review({ product: productId, user: userId, rating, comment });
    await newReview.save();
    return newReview;
  }

  static async getProductReviews(productId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return [];
    }
    
    const reviews = await Review.find({ product: productId }).populate("user");
    return reviews;
  }
}

export default ProductService;
