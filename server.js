const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { transcribeAudio } = require('./speechRecognition');
const { getResponse } = require('./nlp');
const say = require('say');
const fs = require('fs');

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

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
