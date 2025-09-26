import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import UserService from '../services/UserService.js'; // Import UserService

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Get bot token

const protect = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        // Populate shop for vendors
        if (user.role === 'vendor' && user.shop) {
            await user.populate('shop');
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const telegramAuth = async (req, res, next) => {
    const { telegramData } = req.body; // Assuming telegramData is sent in the body

    if (!telegramData) {
        return res.status(400).json({ message: 'Telegram data missing' });
    }

    // Verify Telegram data
    const { hash, ...dataCheckString } = telegramData;
    const dataCheckArray = Object.keys(dataCheckString)
        .filter(key => key !== 'hash') // Exclude hash from dataCheckString
        .sort()
        .map(key => (`${key}=${telegramData[key]}`));
    const dataCheck = dataCheckArray.join('\n');

    const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheck).digest('hex');

    if (hmac !== hash) {
        return res.status(401).json({ message: 'Invalid Telegram data hash' });
    }

    // Check if the data is fresh (e.g., within 24 hours)
    if (Date.now() / 1000 - telegramData.auth_date > 86400) {
        return res.status(401).json({ message: 'Telegram data is outdated' });
    }

    try {
        const user = await UserService.findOrCreateTelegramUser({
            telegramId: telegramData.id,
            first_name: telegramData.first_name,
            username: telegramData.username,
        });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        req.user = user;
        req.token = token; // Attach token to request for response
        next();
    } catch (error) {
        console.error('Telegram authentication error:', error);
        res.status(500).json({ message: 'Server error during Telegram authentication' });
    }
};

export { protect, telegramAuth };
