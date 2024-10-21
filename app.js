const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyContainer = document.querySelector('.history');
const commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];

let voices = [];
let selectedVoice = null;
let isListening = false;
let listenTimeout = null;
let mood = 'neutral'; // Default mood

// Speak function with adjustable rate, pitch, and volume
function speak(text, rate = 1, pitch = 1, volume = 1) {
    const textSpeak = new SpeechSynthesisUtterance(text);
    textSpeak.voice = selectedVoice;
    textSpeak.rate = rate;
    textSpeak.volume = volume;
    textSpeak.pitch = pitch;

    window.speechSynthesis.speak(textSpeak);
    content.textContent = text; // Show the spoken word in the output
}

// Load available voices dynamically
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        selectedVoice = voices.find(voice => voice.name === 'Google US English') || voices[0];
    }
}

// Ensure voices are loaded after they change
window.speechSynthesis.onvoiceschanged = loadVoices;

// Greet based on time of day
function wishMe() {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = "Good Morning, Boss...";
    } else if (hour < 17) {
        greeting = "Good Afternoon, Master...";
    } else {
        greeting = "Good Evening, Sir...";
    }
    speak(greeting);
}

// Initialize JARVIS
window.addEventListener('load', () => {
    loadVoices();
    speak("Initializing JARVIS...", 1, 1, 1);
    wishMe();
});

// Advanced Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = false;

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    
    // Check if this is the final result
    const isFinal = event.results[event.resultIndex].isFinal;

    if (isFinal) {
        console.log(`Recognized Speech (Final): ${transcript}`);
        content.textContent = transcript; // Show recognized speech
        takeCommand(transcript.toLowerCase());
        saveCommandHistory(transcript);
        displayCommandHistory();
    }
};

// Manage Speech Recognition Stop
recognition.onend = () => {
    content.textContent = "Click the button to start listening again.";
    clearTimeout(listenTimeout);
    isListening = false;
};

// Handle recognition errors
recognition.onerror = (event) => {
    speak("I didn't catch that. Please try again.");
    setTimeout(() => startListening(), 3000); // Retry listening after 3 seconds
};

// Start Listening Functionality
function startListening(timeoutDuration = 10000) {
    if (!isListening) {
        isListening = true;
        content.textContent = "Listening...";
        recognition.start();

        listenTimeout = setTimeout(() => {
            stopListening();
        }, timeoutDuration);
    }
}

// Stop Listening Function
function stopListening() {
    isListening = false;
    recognition.stop();
    speak("JARVIS has stopped listening.");
}

// Command handling function
function takeCommand(message) {
    const commandMap = {
        'hey jarvis': () => {
            speak("Hello Sir, how may I assist you?");
            startListening();
        },
        'open google': () => {
            speak("Opening Google...");
            window.open("https://google.com", "_blank");
        },
        'open youtube': () => {
            speak("Opening YouTube...");
            window.open("https://youtube.com", "_blank");
        },
        'current president of india': () => {
            speak("The current president of India is Droupadi Murmu.");
        },
        'current prime minister of india': () => {
            speak("The current Prime Minister of India is Narendra Modi.");
        },
        'time': () => {
            const time = new Date().toLocaleTimeString();
            speak(`The current time is ${time}`);
        },
        'date': () => {
            const date = new Date().toLocaleDateString();
            speak(`Today's date is ${date}`);
        },
        'tell me a joke': fetchRandomJoke,
        'latest news': fetchNews,
        'current weather': fetchWeather,
        'show history': () => {
            speak("Here are your recent commands: " + commandHistory.join(", "));
        },
        'clear history': clearCommandHistory,
        'open calculator': () => {
            speak("Opening calculator...");
            window.open('Calculator:///');
        },
        'play music': playMusic,
        'stop music': stopMusic,
        'set happy mood': () => {
            mood = 'happy';
            speak("Mood set to happy.");
        },
        'set sad mood': () => {
            mood = 'sad';
            speak("Mood set to sad.");
        },
        'set neutral mood': () => {
            mood = 'neutral';
            speak("Mood set to neutral.");
        }
    };

    const matchedCommand = Object.keys(commandMap).find(cmd => message.includes(cmd));

    if (matchedCommand) {
        commandMap[matchedCommand]();
    } else {
        respondToUnknownCommand(message);
    }
}

// Respond based on mood and unknown command
function respondToUnknownCommand(message) {
    let response;
    if (mood === 'happy') {
        response = `I'm glad you're curious! Here's what I found about ${message}.`;
    } else if (mood === 'sad') {
        response = `I wish I could help with that. Let me look it up for you.`;
    } else {
        response = `I found some information for ${message}.`;
    }
    speak(response);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
}

// Fetch a random joke
function fetchRandomJoke() {
    fetch('https://official-joke-api.appspot.com/jokes/random')
        .then(response => response.json())
        .then(data => {
            speak(`${data.setup} ... ${data.punchline}`);
        })
        .catch(() => speak("Sorry, I couldn't fetch a joke at the moment."));
}

// Fetch latest news
function fetchNews() {
    fetch('https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_API_KEY')
        .then(response => response.json())
        .then(data => {
            const headline = data.articles[0].title;
            speak(`The latest headline is: ${headline}`);
        })
        .catch(() => speak("Sorry, I couldn't fetch the latest news at the moment."));
}

// Fetch current weather
function fetchWeather() {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_API_KEY&units=metric')
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            speak(`The current weather in Delhi is ${temperature} degrees Celsius with ${description}.`);
        })
        .catch(() => speak("Sorry, I couldn't fetch the current weather at the moment."));
}

// Music control commands
let audioPlayer = null;

function playMusic() {
    audioPlayer = new Audio('path_to_music.mp3');
    audioPlayer.play();
    speak("Playing music...");
}

function stopMusic() {
    if (audioPlayer) {
        audioPlayer.pause();
        speak("Music stopped.");
    }
}

// Save command history to local storage
function saveCommandHistory(command) {
    commandHistory.push(command);
    localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
}

// Display command history on the UI
function displayCommandHistory() {
    historyContainer.innerHTML = ""; // Clear existing history
    commandHistory.forEach((cmd, index) => {
        const commandElement = document.createElement('div');
        commandElement.textContent = `${index + 1}: ${cmd}`; // Format command with index
        historyContainer.appendChild(commandElement); // Append each command to the container
    });
}

// Clear command history
function clearCommandHistory() {
    commandHistory.length = 0;
    localStorage.removeItem('commandHistory');
    displayCommandHistory();
    speak("Command history cleared.");
}

// Button to start/stop listening
btn.addEventListener('click', () => {
    if (!isListening) {
        startListening();
    } else {
        speak("JARVIS is already listening, Sir. Say 'Stop Jarvis' to deactivate.");
    }
});
