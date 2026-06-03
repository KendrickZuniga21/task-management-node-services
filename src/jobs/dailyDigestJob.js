const axios = require('axios');

const {
    retry
} = require('../utils/retry');

const {
    sendNotification
} = require('../services/notificationService');

async function runDailyDigest() {

    try {

        console.log(
            'Running daily digest job...'
        );

        const loginResponse =
            await retry(
                () => axios.post(
                    `${process.env.LARAVEL_API_URL}/login`,
                    {
                        email:
                            process.env.SYSTEM_EMAIL,
                        password:
                            process.env.SYSTEM_PASSWORD
                }
            ));

        const token =
            loginResponse.data.token;

        console.log(
            'System login successful'
        );

        const response =
            await retry(
                () => axios.get(
                `${process.env.LARAVEL_API_URL}/teams/1/tasks?all=true`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            ));

        const tasks =
            response.data;

        const grouped = {};

        tasks.forEach(task => {

            if (
                task.status === 'completed'
            ) {
                return;
            }

            const user =
                task.assigned_user;

            if (!user) {
                return;
            }

            if (
                !grouped[user.id]
            ) {
                grouped[user.id] = {
                    name: user.name,
                    email: user.email,
                    tasks: []
                };
            }

            grouped[user.id]
                .tasks
                .push(task.title);
        });

        Object.entries(grouped)
            .forEach(
                ([userId, userData]) => {

                    const message =
                        `You have ${userData.tasks.length} incomplete tasks:\n` +
                        userData.tasks.join('\n');

                    sendNotification(
                        'Daily Task Digest',
                        message,
                        userData.email,
                        userId,
                        'daily_digest'
                    );

                    console.log(
                        'Digest queued for:',
                        userData.name
                    );
                }
            );

        console.log(
            'Daily digest job finished'
        );

    } catch (error) {

        console.error(
            'Daily digest error:',
            error.message
        );
    }
}

module.exports = {
    runDailyDigest
};