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
                )
            );

        const token =
            loginResponse.data.token;

        console.log(
            'System login successful'
        );

        const teamsResponse =
            await retry(
                () => axios.get(
                    `${process.env.LARAVEL_API_URL}/teams`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )
            );

        const teams =
            teamsResponse.data.data;

        let tasks = [];

        for (const team of teams) {

            const response =
                await retry(
                    () => axios.get(
                        `${process.env.LARAVEL_API_URL}/teams/${team.id}/tasks?all=true`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )
                );

            tasks.push(
                ...response.data
            );
        }

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

            if (
                !task.assigned_user
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
                    task.assigned_user.email,
                    task.assigned_to,
                    'deadline_reminder'
                );

                console.log(
                    'Reminder queued for:',
                    task.assigned_user.name
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