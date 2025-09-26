import express from 'express';
import ReviewController from '../controllers/ReviewController.js';
import { protect as auth } from '../middleware/auth.js';
import authorize from '../middleware/authorization.js';
import validateObjectId from '../middleware/validateObjectId.js';
import paginate from '../middleware/pagination.js'; // Import pagination middleware

const router = express.Router({ mergeParams: true });

router.post('/', validateObjectId('productId'), auth, authorize(['customer']), (req, res, next) => ReviewController.createReview(req, res, next));
router.get('/', validateObjectId('productId'), paginate(), (req, res, next) => ReviewController.getProductReviews(req, res, next));

export default router;
