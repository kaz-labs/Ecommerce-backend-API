import express from 'express';
import OrderController from '../controllers/OrderController.js';
import { protect as auth } from '../middleware/auth.js';
import paginate from '../middleware/pagination.js'; // Import pagination middleware

const router = express.Router();

router.post('/', auth, (req, res, next) => OrderController.createOrder(req, res, next));
router.get('/', auth, paginate(), (req, res, next) => OrderController.getAllOrders(req, res, next));
router.get('/:id', auth, (req, res, next) => OrderController.getOrderById(req, res, next));

export default router;
