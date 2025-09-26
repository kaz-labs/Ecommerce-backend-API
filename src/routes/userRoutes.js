import express from 'express';
import UserController from '../controllers/UserController.js';
import { protect as auth, telegramAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', (req, res, next) => UserController.registerUser(req, res, next));
router.post('/login', (req, res, next) => UserController.loginUser(req, res, next));
router.post('/telegram-auth', telegramAuth, (req, res) => {
    res.status(200).json({ user: req.user, token: req.token });
});
router.get('/me', auth, (req, res, next) => UserController.getUserProfile(req, res, next));
router.patch('/me', auth, (req, res, next) => UserController.updateUserProfile(req, res, next));

export default router;
