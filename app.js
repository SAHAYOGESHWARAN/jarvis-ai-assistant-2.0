const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyContainer = document.querySelector('.history');
const commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];

let voices = [];
let selectedVoice = null;
let isListening = false;
let listenTimeout = null;

// Speak function with adjustable rate, pitch, and volume
function speak(text, rate = 1, pitch = 1, volume = 1, duration = 10000) {
    // Log the spoken text, rate, pitch, and volume before starting
    console.log(`Text to be spoken: "${text}"`);
    console.log(`Speaking with rate: ${rate}, pitch: ${pitch}, volume: ${volume}`);

    // Create the speech synthesis utterance
    const textSpeak = new SpeechSynthesisUtterance(text);
    textSpeak.voice = selectedVoice;
    textSpeak.rate = rate;
    textSpeak.volume = volume;
    textSpeak.pitch = pitch;

    // Speak the text
    window.speechSynthesis.speak(textSpeak);

    // Update the displayed content
    content.textContent = text; // Show the spoken word in the output
    
    // Log the action in the console after speaking starts
    console.log(`JARVIS is now speaking: "${text}"`);

    // Set a timeout to stop speaking after the specified duration
    setTimeout(() => {
        // Stop speaking
        window.speechSynthesis.cancel();
        console.log(`JARVIS stopped speaking after ${duration / 1000} seconds.`);
    }, duration); // duration is in milliseconds
}

// Load available voices dynamically
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    console.log("Voices loaded:", voices);
    
    if (voices.length > 0) {
        selectedVoice = voices.find(voice => voice.name === 'Google US English') || voices[0];
        console.log(`Selected voice: ${selectedVoice.name}`);
    } else {
        console.error("No voices available.");
    }
}

// Ensure voices are loaded after they change
window.speechSynthesis.onvoiceschanged = loadVoices;

// Greet based on time of day
function wishMe() {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = "Good Morning, saha Boss...";
    } else if (hour < 17) {
        greeting = "Good Afternoon, saha Master...";
    } else {
        greeting = "Good Evening, saha Sir...";
    }
    console.log(`Greeting based on time: ${greeting}`);
    speak(greeting);
}

// Initialize JARVIS
window.addEventListener('load', () => {
    console.log("Initializing JARVIS...");
    loadVoices();
    speak("Initializing JARVIS...", 1, 1, 1);
    wishMe();
});

// Advanced Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.continuous = false;

// Handle Speech Recognition results
recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    console.log(`Recognized Speech: ${transcript}`);

    content.textContent = transcript; // Show recognized speech
    takeCommand(transcript.toLowerCase());

    saveCommandHistory(transcript);
    displayCommandHistory();
};

// Manage Speech Recognition Stop
recognition.onend = () => {
    console.log("Speech recognition ended.");
    content.textContent = "Click the button to start listening again.";
    clearTimeout(listenTimeout);
    isListening = false;
};

// Handle recognition errors
recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    speak("I didn't catch that. Please try again.");
    setTimeout(() => startListening(), 3000); // Retry listening after 3 seconds
};

// Start Listening Functionality (with adjustable timeout)
function startListening(timeoutDuration = 10000) {
    if (!isListening) {
        isListening = true;
        console.log("Listening started...");
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
    console.log("Listening stopped.");
    recognition.stop();
    speak("JARVIS has stopped listening.");
}

// Command handling function
function takeCommand(message) {
    console.log(`Processing command: ${message}`);
    
    const commandMap = {
        'hey jarvis': () => {
            speak("Hello Sir, how may I assist you?");
            startListening();
        },
        'open google': () => {
            speak("Opening Google...");
            console.log("Opening Google in new tab...");
            window.open("https://google.com", "_blank");
        },
        'open youtube': () => {
            speak("Opening YouTube...");
            console.log("Opening YouTube in new tab...");
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
            console.log(`Current time: ${time}`);
            speak(`The current time is ${time}`);
        },
        'date': () => {
            const date = new Date().toLocaleDateString();
            console.log(`Current date: ${date}`);
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
            console.log("Opening calculator...");
            window.open('Calculator:///');
        },
        'play music': playMusic,
        'stop music': stopMusic
    };

    const matchedCommand = Object.keys(commandMap).find(cmd => message.includes(cmd));

    if (matchedCommand) {
        console.log(`Matched command: ${matchedCommand}`);
        commandMap[matchedCommand]();
    } else {
        console.log(`No command matched. Searching Google for: ${message}`);
        speak(`I found some information for ${message} on Google`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
    }
}

// Fetch a random joke
function fetchRandomJoke() {
    console.log("Fetching a random joke...");
    fetch('https://official-joke-api.appspot.com/jokes/random')
        .then(response => response.json())
        .then(data => {
            console.log(`Joke: ${data.setup} ... ${data.punchline}`);
            speak(`${data.setup} ... ${data.punchline}`);
        })
        .catch(error => {
            console.error('Error fetching joke:', error);
            speak("Sorry, I couldn't fetch a joke at the moment.");
        });
}

// Fetch latest news
function fetchNews() {
    console.log("Fetching latest news...");
    fetch('https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_API_KEY')
        .then(response => response.json())
        .then(data => {
            const headline = data.articles[0].title;
            console.log(`Latest news headline: ${headline}`);
            speak(`The latest headline is: ${headline}`);
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            speak("Sorry, I couldn't fetch the latest news at the moment.");
        });
}

// Fetch current weather
function fetchWeather() {
    console.log("Fetching current weather...");
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_API_KEY&units=metric')
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            console.log(`Weather in Delhi: ${temperature}°C, ${description}`);
            speak(`The current weather in Delhi is ${temperature} degrees Celsius with ${description}.`);
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            speak("Sorry, I couldn't fetch the current weather at the moment.");
        });
}

// Music control commands (use Web Audio API or external API)
let audioPlayer = null;

function playMusic() {
    console.log("Playing music...");
    audioPlayer = new Audio('path_to_music.mp3');
    audioPlayer.play();
    speak("Playing music...");
}

function stopMusic() {
    if (audioPlayer) {
        console.log("Stopping music...");
        audioPlayer.pause();
        speak("Music stopped.");
    }
}

// Save command history to local storage
function saveCommandHistory(command) {
    console.log(`Saving command to history: ${command}`);
    commandHistory.push(command);
    localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
}

// Display command history on the UI
function displayCommandHistory() {
    console.log("Displaying command history...");
    historyContainer.innerHTML = ""; // Clear existing history
    commandHistory.forEach((cmd, index) => {
        const commandElement = document.createElement('div');
        commandElement.textContent = `${index + 1}: ${cmd}`; // Format command with index
        historyContainer.appendChild(commandElement); // Append each command to the container
        console.log(`Displayed command: ${index + 1}: ${cmd}`);
    });
}

// Clear command history
function clearCommandHistory() {
    console.log("Clearing command history...");
    commandHistory.length = 0;
    localStorage.removeItem('commandHistory');
    displayCommandHistory();
    speak("Command history cleared.");
}

// Button to start/stop listening
btn.addEventListener('click', () => {
    console.log(`Button clicked. Listening state: ${isListening}`);
    if (!isListening) {
        startListening();
    } else {
        speak("JARVIS is already listening, saha. Say 'Stop Jarvis' to deactivate.");
    }
});

