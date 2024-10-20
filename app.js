const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyContainer = document.querySelector('.history'); // Container for displaying command history
const commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || []; // Load command history from local storage
let voices = [];
let selectedVoice = null;
let isListening = false; // Track if JARVIS is listening
let listenTimeout = null; // To keep track of the listen timeout

// Speak function with voice selection
function speak(text) {
    const textSpeak = new SpeechSynthesisUtterance(text);
    textSpeak.voice = selectedVoice; // Set selected voice
    textSpeak.rate = 1; // Default rate
    textSpeak.volume = 1; // Default volume
    textSpeak.pitch = 1; // Default pitch

    console.log(`Speaking: ${text}`);
    window.speechSynthesis.speak(textSpeak);
}

// Load available voices
function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    selectedVoice = voices.find(voice => voice.name === 'Google US English') || voices[0]; // Set default voice
}

// Wish the user based on the time of day
function wishMe() {
    const hour = new Date().getHours();
    const greeting = (hour < 12) ? "Good Morning saha Boss..." :
                     (hour < 17) ? "Good Afternoon saha Master..." : 
                     "Good Evening saha sir...";
    speak(greeting);
}

// Load the page
window.addEventListener('load', () => {
    loadVoices();
    speak("Initializing JARVIS...");
    wishMe();
});

// Set up Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true; // Show interim results

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript.trim();
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());

    // Log the command for history
    saveCommandHistory(transcript);
    displayCommandHistory();
};

recognition.onend = () => {
    content.textContent = "Click the button to start listening again.";
    clearTimeout(listenTimeout); // Clear the timeout
    isListening = false; // Reset listening flag after stopping
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    speak("I didn't catch that, please try again.");
};

// Start listening function (with 10 seconds auto stop)
function startListening() {
    if (!isListening) {
        isListening = true; // Set listening state to true
        content.textContent = "Listening for 10 seconds...";
        recognition.start(); // Start the speech recognition service

        // Set a timeout to stop listening after 10 seconds
        listenTimeout = setTimeout(() => {
            stopListening(); // Automatically stop listening after 10 seconds
        }, 10000); // 10 seconds
    }
}

// Stop listening function
function stopListening() {
    isListening = false; // Set listening state to false
    recognition.stop(); // Stop the speech recognition service
    speak("JARVIS has stopped listening.");
}

// Handle voice commands
function takeCommand(message) {
    let recognized = false; // Flag to indicate if a command was recognized

    // Commands using regex for better matching
    if (/^(hey|hello) jarvis/i.test(message)) {
        recognized = true;
        speak("Hello Sir, How May I Help You?");
        isListening = true; // Activate listening
        startListening(); // Start listening for commands
    } else if (/stop jarvis/i.test(message)) {
        recognized = true;
        stopListening(); // Stop listening
    } else if (/open google/i.test(message)) {
        recognized = true;
        speak("Opening Google...");
        window.open("https://google.com", "_blank");
    } else if (/open youtube/i.test(message)) {
        recognized = true;
        speak("Opening Youtube...");
        window.open("https://youtube.com", "_blank");
    } else if (/current president of india/i.test(message)) {
        recognized = true;
        speak("The current president of India is Droupadi Murmu.");
    } else if (/current prime minister of india/i.test(message)) {
        recognized = true;
        speak("The current Prime Minister of India is Narendra Modi.");
    } else if (/latest news/i.test(message)) {
        recognized = true;
        fetchNews();
    } else if (/current weather/i.test(message)) {
        recognized = true;
        fetchWeather();
    } else if (/time/i.test(message)) {
        const time = new Date().toLocaleTimeString();
        recognized = true;
        speak(`The current time is ${time}`);
    } else if (/date/i.test(message)) {
        const date = new Date().toLocaleDateString();
        recognized = true;
        speak(`Today's date is ${date}`);
    } else if (/calculator/i.test(message)) {
        recognized = true;
        speak("Opening Calculator...");
        window.open('Calculator:///');
    } else if (/joke/i.test(message)) {
        recognized = true;
        fetchRandomJoke();
    } else if (/history/i.test(message)) {
        recognized = true;
        speak("Here are your recent commands: " + commandHistory.join(", "));
    } else if (/clear history/i.test(message)) {
        recognized = true;
        clearCommandHistory();
    } else {
        recognized = true;
        const query = message.trim();
        speak(`I found some information for ${query} on Google`);
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    }

    // Feedback if no command was recognized
    if (!recognized) {
        speak("I'm not sure how to help with that.");
    }
}

// Fetch a random joke
function fetchRandomJoke() {
    fetch('https://official-joke-api.appspot.com/jokes/random')
        .then(response => response.json())
        .then(data => {
            const joke = `${data.setup} ${data.punchline}`;
            speak(joke);
        })
        .catch(error => {
            console.error('Error fetching joke:', error);
            speak("Sorry, I couldn't fetch a joke at the moment.");
        });
}

// Fetch latest news (use your own API key)
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

// Fetch current weather (use your own API key)
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
    historyContainer.innerHTML = ""; // Clear previous history display
    commandHistory.forEach((cmd, index) => {
        const commandElement = document.createElement('div');
        commandElement.textContent = `${index + 1}: ${cmd}`;
        historyContainer.appendChild(commandElement);
    });
}

// Clear command history
function clearCommandHistory() {
    commandHistory.length = 0; // Clear array
    localStorage.removeItem('commandHistory'); // Remove from local storage
    displayCommandHistory(); // Refresh the displayed history
}

// Load voices when available
window.speechSynthesis.onvoiceschanged = loadVoices;

// Start listening when the button is clicked
btn.addEventListener('click', () => {
    if (!isListening) {
        startListening(); // Start listening if not already listening
    } else {
        speak("JARVIS is already listening saha. Say 'Stop Jarvis' to deactivate.");
    }
});
