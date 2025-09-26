import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { protect as auth } from '../middleware/auth.js';
import authorize from '../middleware/authorization.js';
import validateObjectId from '../middleware/validateObjectId.js';
import paginate from '../middleware/pagination.js'; // Import pagination middleware
import reviewRouter from './reviewRoutes.js';

const router = express.Router({ mergeParams: true });

router.use('/:productId/reviews', reviewRouter);

router.post('/', auth, authorize(['vendor', 'admin']), (req, res, next) => ProductController.createProduct(req, res, next));
router.get('/', paginate(), (req, res, next) => ProductController.getAllProducts(req, res, next));
router.get('/:id', validateObjectId(), (req, res, next) => ProductController.getSingleProduct(req, res, next));
router.patch('/:id', validateObjectId(), auth, authorize(['vendor', 'admin']), (req, res, next) => ProductController.updateProduct(req, res, next));
router.delete('/:id', validateObjectId(), auth, authorize(['vendor', 'admin']), (req, res, next) => ProductController.deleteProduct(req, res, next));

export default router;
