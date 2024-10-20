const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyContainer = document.querySelector('.history'); 
const commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || []; 

let voices = [];
let selectedVoice = null;
let isListening = false; 
let listenTimeout = null; 

// Speak function with more adjustable settings
function speak(text, rate = 1, pitch = 1, volume = 1) {
    const textSpeak = new SpeechSynthesisUtterance(text);
    textSpeak.voice = selectedVoice; 
    textSpeak.rate = rate; 
    textSpeak.volume = volume; 
    textSpeak.pitch = pitch; 

    console.log(`Speaking: ${text}`); 
    window.speechSynthesis.speak(textSpeak);
}

// Load available voices dynamically
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.name === 'Google US English') || voices[0]; 
}

// Wish the user based on the time of day
function wishMe() {
    const hour = new Date().getHours();
    const greeting = (hour < 12) ? "Good Morning, saha Boss..." :
                     (hour < 17) ? "Good Afternoon, saha Master..." : 
                     "Good Evening, saha Sir...";
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

// Handle Speech Recognition results
recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.trim();
    console.log(`Recognized Speech: ${transcript}`);
    
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
    
    saveCommandHistory(transcript); 
    displayCommandHistory();
};

// Manage Speech Recognition Stop
recognition.onend = () => {
    content.textContent = "Click the button to start listening again.";
    clearTimeout(listenTimeout);
    isListening = false; 
};

// Handle recognition errors more gracefully
recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    speak("I didn't catch that. Please try again.");
    setTimeout(() => startListening(), 3000); 
};

// Improved Listening Functionality (with Timeout)
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

// Stop listening explicitly
function stopListening() {
    isListening = false; 
    recognition.stop(); 
    speak("JARVIS has stopped listening.");
}

// Handle voice commands using a flexible mapping
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
        'clear history': clearCommandHistory
    };

    const matchedCommand = Object.keys(commandMap).find(cmd => message.includes(cmd));
    
    if (matchedCommand) {
        commandMap[matchedCommand]();
    } else {
        speak(`I found some information for ${message} on Google`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
    }
}

// Fetch a random joke (Improved error handling)
function fetchRandomJoke() {
    fetch('https://official-joke-api.appspot.com/jokes/random')
        .then(response => response.json())
        .then(data => {
            speak(`${data.setup} ... ${data.punchline}`);
        })
        .catch(error => {
            console.error('Error fetching joke:', error);
            speak("Sorry, I couldn't fetch a joke at the moment.");
        });
}

// Fetch latest news
function fetchNews() {
    fetch('https://newsapi.org/v2/top-headlines?country=in&apiKey=YOUR_API_KEY')
        .then(response => response.json())
        .then(data => {
            const headline = data.articles[0].title;
            speak(`The latest headline is: ${headline}`);
        })
        .catch(error => {
            console.error('Error fetching news:', error);
            speak("Sorry, I couldn't fetch the latest news at the moment.");
        });
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
        .catch(error => {
            console.error('Error fetching weather:', error);
            speak("Sorry, I couldn't fetch the current weather at the moment.");
        });
}

// Save command history to local storage
function saveCommandHistory(command) {
    commandHistory.push(command);
    localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
}

// Display command history on the UI
function displayCommandHistory() {
    historyContainer.innerHTML = "";
    commandHistory.forEach((cmd, index) => {
        const commandElement = document.createElement('div');
        commandElement.textContent = `${index + 1}: ${cmd}`;
        historyContainer.appendChild(commandElement);
    });
}

// Clear command history
function clearCommandHistory() {
    commandHistory.length = 0;
    localStorage.removeItem('commandHistory'); 
    displayCommandHistory(); 
    speak("Command history cleared.");
}

// Load voices dynamically
window.speechSynthesis.onvoiceschanged = loadVoices;

// Button to start/stop listening
btn.addEventListener('click', () => {
    if (!isListening) {
        startListening(); 
    } else {
        speak("JARVIS is already listening saha . Say 'Stop Jarvis' to deactivate.");
    }
});


