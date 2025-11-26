import express from 'express';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    subscribeDevice,
    unsubscribeDevice,
    updateSettings,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.post('/device-token', authenticate, subscribeDevice);
router.delete('/device-token', authenticate, unsubscribeDevice);
router.put('/settings', authenticate, updateSettings);

export default router;
