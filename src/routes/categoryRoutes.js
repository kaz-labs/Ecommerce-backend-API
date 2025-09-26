import express from 'express';
import CategoryController from '../controllers/CategoryController.js';
import { protect as auth } from '../middleware/auth.js';
import authorize from '../middleware/authorization.js';
import paginate from '../middleware/pagination.js'; // Import pagination middleware

const router = express.Router();

router.post('/', auth, authorize(['admin']), (req, res, next) => CategoryController.createCategory(req, res, next));
router.get('/', paginate(), (req, res, next) => CategoryController.getAllCategories(req, res, next));

export default router;
