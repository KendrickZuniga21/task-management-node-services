let ioInstance;

const setIO = (io) => {
    ioInstance = io;
};

const {
    addToQueue
} = require('./notificationQueue');

const sendNotification = (
    title,
    message,
    email = 'test@example.com',
    user_id = null,
    event_type = 'general'
) => {

const queued = addToQueue({
    title,
    message,
    email,
    user_id,
    event_type
});

return queued;
};

module.exports = {
    setIO,
    sendNotification
};