const axios = require('axios');

const cache = {};

async function getTaskSummary(token, teamId) {

    const now = Date.now();

    if (
        cache[teamId] &&
        cache[teamId].expiresAt > now
    ) {
        console.log('Using cached analytics');

        return cache[teamId].data;
    }

    console.log('Fetching analytics from Laravel');

    const response = await axios.get(
        `${process.env.LARAVEL_API_URL}/teams/${teamId}/tasks?all=true`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const allTasks = response.data;

    const summary = {
        total_tasks: allTasks.length,
        pending: allTasks.filter(
            t => t.status === 'pending'
        ).length,

        in_progress: allTasks.filter(
            t => t.status === 'in_progress'
        ).length,

        completed: allTasks.filter(
            t => t.status === 'completed'
        ).length,

        high_priority: allTasks.filter(
            t => t.priority === 'high'
        ).length
    };

    cache[teamId] = {
        data: summary,
        expiresAt: now + (60 * 60 * 1000)
    };

    return summary;
}


async function getTeamProductivity(token, teamId) {

    const response = await axios.get(
        `${process.env.LARAVEL_API_URL}/teams/${teamId}/tasks?all=true`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const tasks = response.data;

    const grouped = {};

    tasks.forEach(task => {

        const user =
            task.assigned_user?.name ||
            'Unassigned';

        if (!grouped[user]) {
            grouped[user] = {
                user,
                task_count: 0,
                completed_tasks: 0
            };
        }

        grouped[user].task_count++;

        if (task.status === 'completed') {
            grouped[user].completed_tasks++;
        }
    });

    return Object.values(grouped).map(
        user => ({
            ...user,
            completion_rate:
                user.task_count === 0
                    ? 0
                    : Number(
                        (
                            user.completed_tasks /
                            user.task_count
                        ) * 100
                    ).toFixed(2)
        })
    );
}

async function getUpcomingDeadlines(
    token,
    teamId
) {

    const response = await axios.get(
        `${process.env.LARAVEL_API_URL}/teams/${teamId}/tasks?all=true`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const tasks = response.data;

    const now = new Date();

    const sevenDaysLater =
        new Date();

    sevenDaysLater.setDate(
        now.getDate() + 7
    );

    const upcoming = tasks.filter(task => {

        if (
            !task.due_date ||
            task.status === 'completed'
        ) {
            return false;
        }

        const due = new Date(task.due_date);

        const dueDateOnly =
            new Date(
                due.getFullYear(),
                due.getMonth(),
                due.getDate()
            );

        const nowDateOnly =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        const sevenDaysDateOnly =
            new Date(
                sevenDaysLater.getFullYear(),
                sevenDaysLater.getMonth(),
                sevenDaysLater.getDate()
            );

        return (
            dueDateOnly >= nowDateOnly &&
            dueDateOnly <= sevenDaysDateOnly
        );
    });

    const grouped = {};

    upcoming.forEach(task => {

        const user =
            task.assigned_user?.name ||
            'Unassigned';

        if (!grouped[user]) {
            grouped[user] = [];
        }

        grouped[user].push(task);
    });

    return grouped;
}

module.exports = {
    getTaskSummary,
    getTeamProductivity,
    getUpcomingDeadlines
};