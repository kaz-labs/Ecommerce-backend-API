import ReviewService from '../services/ReviewService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class ReviewController {
  static createReview = controllerWrapper(async (req, res) => {
    // Assuming user is authenticated and user ID is available in req.user
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const review = await ReviewService.createReview({
      productId,
      userId: req.user.id,
      rating,
      comment,
    });
    res.status(201).json(review);
  });

  static getProductReviews = controllerWrapper(async (req, res) => {
    const { productId } = req.params;
    const { skip, limit, sort } = req.pagination;
    const reviews = await ReviewService.getProductReviews(productId, { skip, limit, sort });
    res.status(200).json(reviews);
  });

  static updateReview = controllerWrapper(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await ReviewService.updateReview(reviewId, rating, comment);
    res.status(200).json(review);
  });
}

export default ReviewController;
