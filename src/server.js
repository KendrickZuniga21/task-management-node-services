const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const notificationRoutes = require('./routes/notificationRoutes');
const {
    setIO
} = require('./services/notificationService');
const analyticsRoutes = require('./routes/analyticsRoutes');

const {
    startWorker,
    setIO: setWorkerIO
} = require('./jobs/notificationWorker');

const {
    startScheduler
} = require('./jobs/scheduler');

const exportRoutes =
    require('./routes/exportRoutes');


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

setIO(io);

setWorkerIO(io);
startWorker();
startScheduler();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Node service is running'
    });
});

app.use('/notifications', notificationRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/export', exportRoutes);

io.on('connection', (socket) => {

    console.log(
        'Client connected:',
        socket.id
    );

    socket.on(
        'join-room',
        (room) => {

            socket.join(room);

            console.log(
                'Joined room:',
                room
            );

        }
    );

    socket.on(
        'disconnect',
        () => {

            console.log(
                'Client disconnected:',
                socket.id
            );

        }
    );

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on(
    'SIGTERM',
    () => {

        console.log(
            'SIGTERM received. Shutting down gracefully...'
        );

        server.close(() => {

            console.log(
                'HTTP server closed'
            );

            process.exit(0);
        });
    }
);

process.on(
    'SIGINT',
    () => {

        console.log(
            'SIGINT received. Shutting down gracefully...'
        );

        server.close(() => {

            console.log(
                'HTTP server closed'
            );

            process.exit(0);
        });
    }
);

