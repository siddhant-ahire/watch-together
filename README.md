# Watch Together
Here's a quick demo of how the app works:

<img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3ZhenNmdnZveWhqdDJ2ODN0YzlreHpidjloYnBid2QwZWI2cHVvbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IPZZxhtpI4bZfmVTYX/giphy.gif" alt="App Demo" width="700"/>

## Project Overview

Watch Together is a web application that allows users to upload and watch videos simultaneously with friends or family, regardless of their locations. Leveraging real-time communication through Socket.IO, the app ensures that all connected users stay in sync while enjoying their favorite videos together. This project showcases the integration of video playback, file uploads, and real-time interactions, creating an engaging and interactive user experience.

## Key Features

- **Video Uploading**: Users can easily upload their video files, which are stored on the server and made available for all connected users.
- **Real-Time Synchronization**: With Socket.IO, all connected clients receive real-time updates for play, pause, seek, and volume control actions, ensuring everyone watches the same video at the same time.
- **Interactive Video Player**: The app includes a user-friendly video player with controls for play, pause, seeking, volume adjustment, and fullscreen mode.
- **Responsive Design**: The application is designed to be mobile-friendly, allowing users to watch videos on various devices.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, EJS
- **Backend**: Node.js, Express, Socket.IO, Multer
- **Storage**: Local file system for video uploads
- **Real-Time Communication**: Socket.IO for handling real-time events

## Getting Started

To set up the project locally, follow these steps:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the server with `node server.js`.
4. Open the application in your web browser and begin uploading videos and watching together!

## Future Enhancements

- Implement user authentication for personalized experiences.
- Add a chat feature for users to communicate while watching videos.
- Support for additional video formats and streaming options.

## Conclusion

Watch Together is a fun and interactive way to enjoy videos with others, making long-distance viewing more enjoyable. Whether you're watching movies, tutorials, or personal videos, this application enhances the shared experience of video watching.
