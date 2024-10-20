require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { transcribeAudio } = require('./speechRecognition');
const { getResponse } = require('./nlp');
const say = require('say');
const fs = require('fs');
const { scheduleTask, cancelTask } = require('./taskScheduler');
const { setContext, getContext, clearContext } = require('./contextManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('audio', async (audioData) => {
        try {
            // Transcribe the audio to text
            const transcript = await transcribeAudio(audioData);

            // Get the AI's response using GPT
            const aiResponse = await getResponse(transcript);

            // Speak the response out loud
            say.speak(aiResponse);

            // Send the response back to the user
            socket.emit('response', aiResponse);
        } catch (error) {
            console.error('Error processing audio:', error);
            socket.emit('error', 'Error processing your request.');
        }
    });
});

io.on('connection', (socket) => {
    console.log('User connected');

    // Existing audio event listener...

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
});

socket.on('audio', async (audioData) => {
    try {
        const transcript = await transcribeAudio(audioData);
        const previousContext = getContext('lastResponse');

        // Store current task in context
        setContext('lastUserInput', transcript);

        // Get AI's response considering previous context
        const aiResponse = await getResponse(`${previousContext ? previousContext + '\n' : ''}${transcript}`);
        setContext('lastResponse', aiResponse);

        say.speak(aiResponse);
        socket.emit('response', aiResponse);
    } catch (error) {
        console.error('Error processing audio:', error);
        socket.emit('error', 'Error processing your request.');
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
