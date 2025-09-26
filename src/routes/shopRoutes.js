import express from 'express';
import ShopController from '../controllers/ShopController.js';
import { protect as auth } from '../middleware/auth.js';
import authorize from '../middleware/authorization.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.post('/', auth, authorize(['vendor']), (req, res, next) => ShopController.createShop(req, res, next));
router.get('/:id', validateObjectId(), (req, res, next) => ShopController.getShopById(req, res, next));
router.patch('/:id', validateObjectId(), auth, authorize(['vendor']), (req, res, next) => ShopController.updateShop(req, res, next));

export default router;
