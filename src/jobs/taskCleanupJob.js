const axios = require('axios');

const {
    retry
} = require('../utils/retry');

async function runTaskCleanup() {

    try {

        console.log(
            'Running task cleanup job...'
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

        const response =
            await retry(
                () => axios.get(
                    `${process.env.LARAVEL_API_URL}/tasks?all=true`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )
            );

        const tasks =
            response.data;

        const thirtyDaysAgo =
            new Date();

        thirtyDaysAgo.setDate(
            thirtyDaysAgo.getDate() - 30
        );

        let archivedCount = 0;

        for (const task of tasks) {

            if (
                task.status !== 'cancelled' ||
                task.deleted_at
            ) {
                continue;
            }

            const updatedAt =
                new Date(task.updated_at);

            if (
                updatedAt > thirtyDaysAgo
            ) {
                continue;
            }

            await retry(
                () => axios.delete(
                    `${process.env.LARAVEL_API_URL}/tasks/${task.id}/archive`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )
            );

            archivedCount++;

            console.log(
                'Archived task:',
                task.id
            );
        }

        console.log(
            `Task cleanup finished. Archived ${archivedCount} task(s).`
        );

    } catch (error) {

        console.error(
            'Task cleanup error:',
            error.message
        );
    }
}

module.exports = {
    runTaskCleanup
};