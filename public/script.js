// backend/public/script.js
const socket = io('http://192.168.31.61:3001'); // Adjust if using a different backend URL
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const seekBar = document.getElementById('seekBar');
const videoFileInput = document.getElementById('videoFile');
const uploadForm = document.getElementById('uploadForm');
const volumeControl = document.getElementById('volumeControl');
const fullscreenBtn = document.getElementById('fullscreenBtn');

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
