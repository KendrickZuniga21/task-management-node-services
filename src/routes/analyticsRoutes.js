const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const analyticsAuthMiddleware =
    require('../middleware/analyticsAuthMiddleware');

const {
    getTaskSummary,
    getTeamProductivity,
    getUpcomingDeadlines

} = require('../services/analyticsService');

router.get(
    '/task-summary',
    authMiddleware,
    analyticsAuthMiddleware,
    async (req, res) => {

        try {

            const teamId = req.query.team_id;

            if (!teamId) {
                return res.status(422).json({
                    message: 'team_id is required'
                });
            }

            const token = req.headers.authorization
                .split(' ')[1];

            const summary = await getTaskSummary(
                token,
                teamId
            );

            return res.json(summary);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message: 'Failed to generate analytics',
                error: error.message
            });
        }
    }
);

router.get(
    '/team-productivity',
    authMiddleware,
    analyticsAuthMiddleware,
    async (req, res) => {

        try {

            const teamId = req.query.team_id;

            if (!teamId) {
                return res.status(422).json({
                    message: 'team_id is required'
                });
            }

            const token =
                req.headers.authorization
                    .split(' ')[1];

            const result =
                await getTeamProductivity(
                    token,
                    teamId
                );

            return res.json(result);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message:
                    'Failed to generate productivity analytics',
                error: error.message
            });
        }
    }
);

router.get(
    '/upcoming-deadlines',
    authMiddleware,
    analyticsAuthMiddleware,
    async (req, res) => {

        try {

            const teamId = req.query.team_id;

            if (!teamId) {
                return res.status(422).json({
                    message: 'team_id is required'
                });
            }

            const token =
                req.headers.authorization
                    .split(' ')[1];

            const result =
                await getUpcomingDeadlines(
                    token,
                    teamId
                );

            return res.json(result);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message:
                    'Failed to fetch upcoming deadlines',
                error: error.message
            });
        }
    }
);

module.exports = router;