const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const commandHistory = []; // Store command history

// Speak function
function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    
    // Log the spoken text
    console.log(`Speaking: ${text}`);
    
    window.speechSynthesis.speak(text_speak);
}

// Wish the user based on the time of day
function wishMe() {
    var day = new Date();
    var hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Master...");
    } else {
        speak("Good Evening Sir...");
    }
}

// Load the page
window.addEventListener('load', () => {
    speak("Initializing JARVIS...");
    wishMe();
});

// Set up Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true; // Show interim results

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
    
    // Log the command for history
    commandHistory.push(transcript);
};

recognition.onend = () => {
    content.textContent = "Click the button to start listening again.";
};

recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
    speak("I didn't catch that, please try again.");
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});

// Handle voice commands
function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Sir, How May I Help You? ");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "This is what I found on the internet regarding " + message;
        speak(finalText);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
        const finalText = "This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        const finalText = "The current time is " + time;
        speak(finalText);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
        const finalText = "Today's date is " + date;
        speak(finalText);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        speak("Opening Calculator");
    } else if (message.includes('joke')) {
        fetchRandomJoke();
    } else if (message.includes('history')) {
        speak("Here are your recent commands: " + commandHistory.join(", "));
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "I found some information for " + message + " on Google";
        speak(finalText);
    }
}

// Fetch a random joke
function fetchRandomJoke() {
    fetch('https://official-joke-api.appspot.com/jokes/random')
        .then(response => response.json())
        .then(data => {
            const joke = data.setup + " " + data.punchline;
            speak(joke);
        })
        .catch(error => {
            console.error('Error fetching joke:', error);
            speak("Sorry, I couldn't fetch a joke at the moment.");
        });
}
