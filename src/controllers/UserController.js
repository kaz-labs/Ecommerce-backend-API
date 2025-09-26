import UserService from '../services/UserService.js';
import controllerWrapper from '../utils/controllerWrapper.js';

class UserController {
  /**
   * @swagger
   * /users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - telegramId
   *               - username
   *             properties:
   *               telegramId:
   *                 type: string
   *               username:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Bad request
   *       409:
   *         description: User already exists
   */
  static registerUser = controllerWrapper(async (req, res) => {
    const { telegramId, username, role } = req.body;
    const { user, token } = await UserService.registerUser({ telegramId, username, role });
    res.status(201).json({ user, token });
  });

  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Login a user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - telegramId
   *             properties:
   *               telegramId:
   *                 type: string
   *     responses:
   *       200:
   *         description: User logged in successfully
   *       401:
   *         description: Unauthorized
   */
  static loginUser = controllerWrapper(async (req, res) => {
    const { telegramId } = req.body;
    const { user, token } = await UserService.loginUser({ telegramId });
    res.status(200).json({ user, token });
  });

  /**
   * @swagger
   * /users/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *       404:
   *         description: User not found
   */
  static getUserProfile = controllerWrapper(async (req, res) => {
    const userId = req.user.id;
    const user = await UserService.getUserProfile(userId);
    res.status(200).json(user);
  });

  /**
   * @swagger
   * /users/me:
   *   patch:
   *     summary: Update current user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *     responses:
   *       200:
   *         description: User profile updated successfully
   *       404:
   *         description: User not found
   */
  static updateUserProfile = controllerWrapper(async (req, res) => {
    const userId = req.user.id;
    const user = await UserService.updateUserProfile(userId, req.body);
    res.status(200).json(user);
  });
}

export default UserController;
