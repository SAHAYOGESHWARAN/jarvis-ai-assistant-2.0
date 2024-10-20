require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { transcribeAudio } = require('./speechRecognition');
const { getResponse } = require('./nlp');
const say = require('say');
const { scheduleTask, cancelTask } = require('./taskScheduler');
const { setContext, getContext, clearContext } = require('./contextManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('User connected');

    // Listen for 'audio' events from the client
    socket.on('audio', async (audioData) => {
        try {
            // Transcribe the audio to text
            const transcript = await transcribeAudio(audioData);
            console.log('Transcription:', transcript);

            // Get the previous context for more coherent responses
            const previousContext = getContext('lastResponse');
            setContext('lastUserInput', transcript); // Store current task in context

            // Get AI's response considering previous context
            const aiResponse = await getResponse(`${previousContext ? previousContext + '\n' : ''}${transcript}`);
            setContext('lastResponse', aiResponse); // Store the AI's response in context

            // Speak the response out loud
            say.speak(aiResponse);

            // Send the response back to the user
            socket.emit('response', aiResponse);
        } catch (error) {
            console.error('Error processing audio:', error);
            socket.emit('error', 'Error processing your request.');
        }
    });

    // New listener for scheduling tasks
    socket.on('scheduleTask', ({ time, description }) => {
        const result = scheduleTask(time, description);
        socket.emit('taskResponse', result);
    });

    // New listener for canceling tasks
    socket.on('cancelTask', (description) => {
        const result = cancelTask(description);
        socket.emit('taskResponse', result);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
