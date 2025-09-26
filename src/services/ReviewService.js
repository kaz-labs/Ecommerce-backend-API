import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

class ReviewService {
  static async createReview({ productId, userId, rating, comment }) {
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
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const newReview = new Review({ product: productId, user: userId, rating, comment });
    await newReview.save();
    return newReview;
  }

  static async getProductReviews(productId, { skip = 0, limit = 10, sort = '-createdAt' }) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return [];
    }
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sort);
    return reviews;
  }

  static async updateReview(reviewId, rating, comment) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }
    
    const review = await Review.findById(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }
    review.rating = rating;
    review.comment = comment;
    await review.save();
    return review;
  }
}

export default ReviewService;
