import express from 'express';
import AdminController from '../controllers/AdminController.js';
import { protect as auth } from '../middleware/auth.js';
import authorize from '../middleware/authorization.js';
import paginate from '../middleware/pagination.js'; // Import pagination middleware

const router = express.Router();

router.get('/users', auth, authorize(['admin']), paginate(), (req, res, next) => AdminController.getAllUsers(req, res, next));
router.patch('/users/:id/role', auth, authorize(['admin']), (req, res, next) => AdminController.updateUserRole(req, res, next));

export default router;
