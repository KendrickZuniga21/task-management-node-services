const axios = require('axios');

async function analyticsAuthMiddleware(
    req,
    res,
    next
) {
    try {

        const authHeader =
            req.headers.authorization;

        const token =
            authHeader.split(' ')[1];

        const response =
            await axios.get(
                `${process.env.LARAVEL_API_URL}/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const user = response.data;

        const teamId =
            parseInt(req.query.team_id);

        if (user.role === 'member') {
            return res.status(403).json({
                message:
                    'Members cannot access analytics'
            });
        }

        if (
            user.role === 'manager' &&
            !user.team_ids.includes(teamId)
        ) {
            return res.status(403).json({
                message:
                    'Managers can only access their own teams'
            });
        }

        req.analyticsUser = user;

        next();

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            message:
                'Analytics authorization failed'
        });
    }
}

module.exports =
    analyticsAuthMiddleware;