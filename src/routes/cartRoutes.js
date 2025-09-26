import express from 'express';
import CartController from '../controllers/CartController.js';
import { protect as auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, (req, res, next) => CartController.getCart(req, res, next));
router.post('/', auth, (req, res, next) => CartController.addItemToCart(req, res, next));
router.patch('/items/:itemId', auth, (req, res, next) => CartController.updateCartItem(req, res, next));
router.delete('/items/:itemId', auth, (req, res, next) => CartController.removeItemFromCart(req, res, next));

export default router;
