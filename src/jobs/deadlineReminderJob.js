const axios = require('axios');

const {
    retry
} = require('../utils/retry');

const {
    sendNotification
} = require('../services/notificationService');

async function runDeadlineReminder() {

    try {

        console.log(
            'Running deadline reminder job...'
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

        const now =
            new Date();

        const next24Hours =
            new Date();

        next24Hours.setHours(
            now.getHours() + 24
        );

        tasks.forEach(task => {
            if (
                !task.due_date ||
                task.status === 'completed'
            ) {
                return;
            }

            const due =
                new Date(task.due_date);

            if (
                due >= now &&
                due <= next24Hours
            ) {
                sendNotification(
                    'Deadline Reminder',
                    `Task "${task.title}" is due within 24 hours`,
                    task.assigned_user?.email ||
                        'test@example.com',
                    task.assigned_to,
                    'deadline_reminder'
                );
            }
        });

        console.log(
            'Deadline reminder job finished'
        );

    } catch (error) {

        console.error(
            'Deadline reminder error:',
            error.message
        );
    }
}

module.exports = {
    runDeadlineReminder
};