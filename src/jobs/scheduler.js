const cron = require('node-cron');

const {
    runDeadlineReminder
} = require('./deadlineReminderJob');

const {
    runDailyDigest
} = require('./dailyDigestJob');

const {
    runTaskCleanup
} = require('./taskCleanupJob');

function startScheduler() {

    console.log(
        'Scheduler started'
    );

    
    cron.schedule(
        '0 */2 * * *',
        async () => {

            console.log(
                'Running deadline reminder cron'
            );

            await runDeadlineReminder();
        }
    );

   
    cron.schedule(
        '0 8 * * *',
        async () => {

            console.log(
                'Running daily digest cron'
            );

            await runDailyDigest();
        }
    );

    
    cron.schedule(
        '0 0 * * *',
        async () => {

            console.log(
                'Running task cleanup cron'
            );

            await runTaskCleanup();
        }
    );
}

module.exports = {
    startScheduler
};