// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidV4 } = require('uuid');


// Setup storage for uploaded videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save to the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    }
});
let currentVideoUrl = ''; // Variable to store the current video URL

const upload = multer({ storage });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Generate a room id when user accesses the root
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
  });
  
// Render the video chat room
app.get('/:room', (req, res) => {
    res.render('index', { roomId: req.params.room });
});
io.on('connection', (socket) => {
    console.log('A user connected');

    // Emit the current video URL to the newly connected client
    if (currentVideoUrl) {
        socket.emit('videoUrl', currentVideoUrl); // Send the current video URL
    }

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', socket.id);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', socket.id);
        });

        socket.on('offer', (offer, to) => {
            socket.to(to).emit('offer', offer, socket.id);
        });

        socket.on('answer', (answer, to) => {
            socket.to(to).emit('answer', answer, socket.id);
        });

        socket.on('ice-candidate', (candidate, to) => {
            socket.to(to).emit('ice-candidate', candidate, socket.id);
        });
    });

    socket.on('play', () => {
        socket.broadcast.emit('play'); // Broadcast play to other clients
    });

    socket.on('pause', () => {
        socket.broadcast.emit('pause'); // Broadcast pause to other clients
    });

    socket.on('seek', (time) => {
        socket.broadcast.emit('seek', time); // Broadcast seek to other clients
    });

    socket.on('videoUrl', (url) => {
        socket.broadcast.emit('videoUrl', url); // Broadcast the video URL to other clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


// Handle video file upload
app.post('/upload', upload.single('videoFile'), (req, res) => {
    currentVideoUrl = `/uploads/${req.file.originalname}`; // Update current video URL
    io.emit('videoUrl', currentVideoUrl); // Emit video URL to all connected clients
    res.json({ url: currentVideoUrl }); // Respond with the URL
});

app.get('/', (req, res) => {
    res.render('index'); // Render the EJS template
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
