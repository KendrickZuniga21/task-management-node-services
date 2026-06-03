const express = require('express');
const router = express.Router();

const {
    sendNotification
} = require('../services/notificationService');

router.post('/send', (req, res) => {

    const {
        title,
        user_id,
        event_type,
        details,
        email
    } = req.body;

    if (
        !title ||
        !details
    ) {
        return res.status(422).json({
            message:
                'title and details are required'
        });
    }

    const queued = sendNotification(
        title,
        details,
        email,
        user_id,
        event_type
    );

    if (!queued) {
        return res.status(429).json({
            message:
                'Notification rate limited'
        });
    }

    return res.json({
        message: 'Notification queued'
    });
});

module.exports = router;