const express = require('express');
const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const {
    exportTasks
} = require('../controllers/exportController');

router.post(
    '/tasks',
    authMiddleware,
    exportTasks
);

module.exports = router;