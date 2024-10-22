// backend/public/script.js
const socket = io('/'); // Adjust if using a different backend URL
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const seekBar = document.getElementById('seekBar');
const videoFileInput = document.getElementById('videoFile');
const uploadForm = document.getElementById('uploadForm');
const volumeControl = document.getElementById('volumeControl');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const syncBtn = document.getElementById('syncBtn');


// Handle video file upload
uploadForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(uploadForm);
    
    // Upload the video file
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Video URL:', data.url);
        socket.emit('videoUrl', data.url); // Emit the video URL to other clients

    })
    .catch(error => {
        console.error('Error uploading video:', error);
    });
});

// Check if the user is running on localhost
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.style.display = 'inline-block'; // Show the sync button only for localhost
}

// Update the seek bar as the video plays
videoPlayer.addEventListener('timeupdate', () => {
    seekBar.value = videoPlayer.currentTime;
});

// Update the seek bar's max value when metadata is loaded
videoPlayer.addEventListener('loadedmetadata', () => {
    seekBar.max = videoPlayer.duration; // Set max to video duration
    seekBar.value = 0; // Reset seek bar value
    fullscreenBtn.style.display = 'inline-block'; // Show the button
});

videoPlayer.addEventListener('click', () => {
    togglePlayPause();
})

// When the play button is clicked
playBtn.addEventListener('click', () => {
    videoPlayer.play();
    socket.emit('play'); // Emit play event to server
});

// When the pause button is clicked
pauseBtn.addEventListener('click', () => {
    videoPlayer.pause();
    socket.emit('pause'); // Emit pause event to server
});

// When the seek bar is changed
seekBar.addEventListener('input', () => {
    videoPlayer.currentTime = seekBar.value;
    socket.emit('seek', seekBar.value); // Emit seek event to server
});

syncBtn.addEventListener('click', () => {
    videoPlayer.currentTime = seekBar.value;
    socket.emit('seek', seekBar.value); // Emit seek event to server
    videoPlayer.play();
    socket.emit('play'); // Emit play event to server
});

// Handle volume control
volumeControl.addEventListener('input', () => {
    // Unmute the video when the volume is changed
    if (videoPlayer.muted) {
        videoPlayer.muted = false; // Unmute
    }
    videoPlayer.volume = volumeControl.value; // Set video volume based on slider
});
// Add event listener to the fullscreen button
fullscreenBtn.addEventListener('click', () => {
    videoPlayer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
});

// Function to play or pause the video
function togglePlayPause() {
    if (videoPlayer.paused) {
        videoPlayer.play();
        socket.emit('play'); // Emit play event to server
    } else {
        videoPlayer.pause();
        socket.emit('pause'); // Emit pause event to server
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent default scroll behavior
        togglePlayPause();
    }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        event.preventDefault(); // Prevent default scroll behavior

        // Define the seek step in seconds
        const step = 5; 

        // Seek backward with ArrowLeft
        if (event.code === 'ArrowLeft') {
            seekBar.value = Math.max(0, seekBar.value - step); // Prevent going below 0
        }

        // Seek forward with ArrowRight
        if (event.code === 'ArrowRight') {
            console.log(seekBar.value, seekBar.max, step);
            seekBar.value = Math.min(seekBar.max, parseInt(seekBar.value) + step); // Prevent exceeding max
        }

        // Update the video and emit the seek event
        videoPlayer.currentTime = seekBar.value;
        socket.emit('seek', seekBar.value);
    }
});

// Socket event listeners for synchronization
socket.on('play', () => {
    videoPlayer.play(); // Play video on other clients
});

socket.on('pause', () => {
    videoPlayer.pause(); // Pause video on other clients
});

socket.on('seek', (time) => {
    videoPlayer.currentTime = time; // Seek video on other clients
});


socket.on('videoUrl', (url) => {
    videoSource.src = url; // Update the video source to the new URL
    videoPlayer.load(); // Load the new video
    videoPlayer.style.display = 'block'; // Show the video player
});

//video size controller
const videoSizeButtonIncrease = document.getElementById('video-size-button-increase');
const videoSizeButtonDecrease = document.getElementById('video-size-button-decrease');
videoSizeButtonIncrease.addEventListener('click', () => {
    // Get the current width and remove 'px' from the value
    let currentWidth = parseInt(window.getComputedStyle(videoPlayer).width);
    videoPlayer.style.width = (currentWidth + 50) + 'px';
});
videoSizeButtonDecrease.addEventListener('click', () => {
    // Get the current width and remove 'px' from the value
    let currentWidth = parseInt(window.getComputedStyle(videoPlayer).width);
    videoPlayer.style.width = (currentWidth - 50) + 'px';
});


// Handle Video Chat Functionality>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<**********************
const myVideo = document.getElementById('my-video');
const muteButton = document.getElementById('muteButton');
const cameraButton = document.getElementById('cameraButton');
const videoGrid = document.getElementById('video-grid');

let myStream;
// let audioEnabled = true;
let videoEnabled = true;
const peers = {};

// Get video/audio from the user's device
navigator.mediaDevices.getUserMedia({
    // audio: {
    //     echoCancellation: { exact: true },
    //     noiseSuppression: { exact: true },
    //     autoGainControl: { exact: true }
    //     // Add more audio constraints as needed
    // },

    video: true,
}).then(stream => {
    myStream = stream;
    myVideo.srcObject = stream;

    socket.emit('join-room', ROOM_ID);

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    // Listen for other events
    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close();
            delete peers[userId];
            const remoteVideo = document.getElementById(userId);
            if (remoteVideo) remoteVideo.remove();
        }
    });
});

function connectToNewUser(userId, stream) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        codecPreferences: [
            { mimeType: 'audio/opus' }
        ]
    });

    peers[userId] = peerConnection;

    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, userId);
        }
    };

    peerConnection.ontrack = event => {
        addRemoteVideo(userId, event.streams[0]);
    };

    peerConnection.createOffer().then(offer => {
        return peerConnection.setLocalDescription(offer);
    }).then(() => {
        socket.emit('offer', peerConnection.localDescription, userId);
    });
}

socket.on('offer', (offer, userId) => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peers[userId] = peerConnection;

    peerConnection.setRemoteDescription(offer).then(() => {
        myStream.getTracks().forEach(track => peerConnection.addTrack(track, myStream));
        return peerConnection.createAnswer();
    }).then(answer => {
        return peerConnection.setLocalDescription(answer);
    }).then(() => {
        socket.emit('answer', peerConnection.localDescription, userId);
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, userId);
        }
    };

    peerConnection.ontrack = event => {
        addRemoteVideo(userId, event.streams[0]);
    };
});

socket.on('answer', (answer, userId) => {
    peers[userId].setRemoteDescription(answer);
});

socket.on('ice-candidate', (candidate, userId) => {
    peers[userId].addIceCandidate(new RTCIceCandidate(candidate));
});

function addRemoteVideo(userId, stream) {
    let videoElement = document.getElementById(userId);
    if (!videoElement) {
        videoElement = document.createElement('video');
        videoElement.id = userId;
        videoElement.autoplay = true;
        videoElement.playsinline = true; // Better for mobile devices
        videoGrid.append(videoElement);
    }
    videoElement.srcObject = stream;
}

// muteButton.addEventListener('click', () => {
//     audioEnabled = !audioEnabled;
//     myStream.getAudioTracks().forEach(track => {
//         track.enabled = audioEnabled;
//     });
//     muteButton.textContent = audioEnabled ? 'Mute' : 'Unmute';
// });

cameraButton.addEventListener('click', () => {
    videoEnabled = !videoEnabled;
    myStream.getVideoTracks().forEach(track => {
        track.enabled = videoEnabled;
    });
    cameraButton.textContent = videoEnabled ? 'Turn Camera Off' : 'Turn Camera On';
});
