const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function transcribeAudio(audioBuffer) {
    const audioBytes = audioBuffer.toString('base64');
    const request = {
        audio: {
            content: audioBytes,
        },
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    return transcription;
}

module.exports = { transcribeAudio };
