const queue = [];

const recentNotifications = {};

function addToQueue(job) {

    const key =
        `${job.user_id}_${job.event_type}`;

    const now = Date.now();

    const lastSent =
        recentNotifications[key];

    if (
        lastSent &&
        now - lastSent < 10000
    ) {
        console.log(
            'Notification rate limited:',
            key
        );

        return false;
    }

    recentNotifications[key] = now;

    queue.push(job);

    console.log(
        'Notification queued:',
        job.event_type
    );

    return true;
}

function getNextJob() {
    return queue.shift();
}

module.exports = {
    addToQueue,
    getNextJob
};