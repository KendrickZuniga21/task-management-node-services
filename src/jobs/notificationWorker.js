const nodemailer = require('nodemailer');
const {
    getNextJob
} = require('../services/notificationQueue');

let io = null;

function setIO(socketIO) {
    io = socketIO;
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function startWorker() {

    setInterval(async () => {

        const job = getNextJob();

        if (!job) {
            return;
        }

        try {

            console.log(
                'Processing notification:',
                job.event_type
            );

            if (io) {
                io.to(
                    `user_${job.user_id}`
                ).emit(
                    'notification',
                    {
                        title: job.title,
                        message: job.message
                    }
                );
            }

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: job.email,
                subject: job.title,
                text: job.message
            });

            console.log(
                'Email sent:',
                job.email
            );

        } catch (error) {

            console.error(
                'Notification worker error:',
                error.message
            );
        }

    }, 3000);
}

module.exports = {
    startWorker,
    setIO
};