const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyContainer = document.querySelector('.history');
const commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || { name: "User ", preferences: {} };

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

// Greet based on time of day and user profile
function wishMe() {
    const hour = new Date().getHours();
    let greeting = `Hello ${userProfile.name}, `;

    if (hour < 12) {
        greeting += "Good Morning! Ready to conquer the day?";
    } else if (hour < 17) {
        greeting += "Good Afternoon! How can I assist you?";
    } else {
        greeting += "Good Evening! What can I do for you tonight?";
    }
    speak(greeting);
}

// Initialize JARVIS
window.addEventListener('load', () => {
    loadVoices();
    speak("Initializing JARVIS... Please wait.", 1, 1, 1);
    wishMe();
});

// Advanced Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = false;

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
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
    speak("Oops! I didn't catch that. Please try again.");
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
    speak("JARVIS has stopped listening. Let me know if you need anything.");
}

// Command handling function
function takeCommand(message) {
    const commandMap = {
        'hey jarvis': () => {
            speak("Hello Sir, how may I assist you today?");
            startListening();
        },
        'open google': () => {
            speak("Opening Google for you...");
            window.open("https://google.com", "_blank");
        },
        'open youtube': () => {
            speak("Opening YouTube, enjoy!");
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
            speak(`The current time is ${time}.`);
        },
        'date': () => {
            const date = new Date().toLocaleDateString();
            speak(`Today's date is ${date}.`);
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
            speak("Mood set to happy. Let's have a great day!");
        },
        'set sad mood': () => {
            mood = 'sad';
            speak("Mood set to sad. Hope you feel better soon.");
        },
        'set neutral mood': () => {
            mood = 'neutral';
            speak("Mood set to neutral. Let's get back to normal.");
        },
        'search': searchQuery,
        'ask question': chatGPTResponse // Adding chatGPT-like question answering
    };

    const matchedCommand = Object.keys(commandMap).find(cmd => message.includes(cmd));

    if (matchedCommand) {
        commandMap[matchedCommand]();
    } else {
        respondToUnknownCommand(message);
    }
}

// Search query handling (Google Search)
function searchQuery(query) {
    speak(`Searching for ${query}...`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
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
    searchQuery(message);
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
    fetch('https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_NEWS_API_KEY')
        .then(response => response.json())
        .then(data => {
            const headline = data.articles[0].title;
            speak(`The latest headline is: ${headline}`);
        })
        .catch(() => speak("Sorry, I couldn't fetch the latest news at the moment."));
}

// Fetch current weather
function fetchWeather() {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_OPENWEATHERMAP_API_KEY&units=metric')
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

// Listen for unknown phrases and prompt search if the query is unrecognized
recognition.onnomatch = (event) => {
    const transcript = event.results[event.resultIndex][0]. transcript.trim();
    speak(`I couldn't find anything for "${transcript}". Let me search that for you.`);
    searchQuery(transcript);
};

// Add API key for search and weather fetching
const NEWS_API_KEY = 'YOUR_NEWS_API_KEY';
const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';

// Fetch latest news
function fetchNews() {
    fetch(`https://newsapi.org/v2/top-headlines?country=in&apiKey=${NEWS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const headline = data.articles[0]?.title || "No headlines found.";
            speak(`The latest headline is: ${headline}`);
        })
        .catch(() => speak("Sorry, I couldn't fetch the latest news at the moment."));
}

// Fetch current weather
function fetchWeather() {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${WEATHER_API_KEY}&units=metric`)
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            speak(`The current weather in Delhi is ${temperature} degrees Celsius with ${description}.`);
        })
        .catch(() => speak("Sorry, I couldn't fetch the current weather at the moment."));
}

// Command to provide real-time responses via chat-like interactions
async function chatGPTResponse(message) {
    const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
            prompt: message,
            max_tokens: 100
        })
    });
    
    const data = await response.json();
    const reply = data.choices[0].text.trim();
    speak(reply);
}

// Modify command handling for longer queries
function takeCommand(message) {
    const commandMap = {
        'hey jarvis': () => {
            speak("Hello Sir, how may I assist you today?");
            startListening();
        },
        'open google': () => {
            speak("Opening Google for you...");
            window.open("https://google.com", "_blank");
        },
        'open youtube': () => {
            speak("Opening YouTube, enjoy!");
            window.open("https://youtube.com", "_blank");
        },
        'current president of india': () => {
            speak("The current president of India is Droupadi Murmu.");
        },
        'current prime minister of india': () => {
            speak("The current Prime Minister of India is Narendra Modi .");
        },
        'time': () => {
            const time = new Date().toLocaleTimeString();
            speak(`The current time is ${time}.`);
        },
        'date': () => {
            const date = new Date().toLocaleDateString();
            speak(`Today's date is ${date}.`);
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
            speak("Mood set to happy. Let's have a great day!");
        },
        'set sad mood': () => {
            mood = 'sad';
            speak("Mood set to sad. Hope you feel better soon.");
        },
        'set neutral mood': () => {
            mood = 'neutral';
            speak("Mood set to neutral. Let's get back to normal.");
        },
        'search': searchQuery,
        'ask question': chatGPTResponse // Adding chatGPT-like question answering
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
    searchQuery(message);
}    