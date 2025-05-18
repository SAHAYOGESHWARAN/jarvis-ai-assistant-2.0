// JARVIS AI Assistant - Advanced Web Version
// Modern, modular, scalable, and feature-rich

// --- DOM Elements ---
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const historyContainer = document.querySelector('.history');

// --- API Keys (from config.js or .env via build) ---
const API_KEYS = window.API_KEYS || {
    OPENAI: 'sk-4A2eKp1A7dEfghijklmnopQRsTUVwxyz1234567890',
    WEATHER: '',
    NEWS: '',
    SMART_HOME: ''
};

// --- State ---
let commandHistory = JSON.parse(localStorage.getItem('commandHistory')) || [];
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: "User",
    preferences: {
        voiceSpeed: 1.1,
        voicePitch: 1,
        autoDarkMode: true,
        personality: 'professional', // professional, casual, humorous
        voiceType: 'default', // male, female, robotic, default
        autoListening: true
    },
    voiceprint: null
};
let conversationContext = [];
let isListening = false;
let selectedVoice = null;
let isSpeaking = false;

// --- Voice Setup ---
window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    if (userProfile.preferences.voiceType === 'female') {
        selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || voices[0];
    } else if (userProfile.preferences.voiceType === 'male') {
        selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) || voices[0];
    } else if (userProfile.preferences.voiceType === 'robotic') {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes('robot')) || voices[0];
    } else {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
};

function speak(text, type = 'response') {
    isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = userProfile.preferences.voiceSpeed;
    utterance.pitch = userProfile.preferences.voicePitch;
    utterance.volume = type === 'error' ? 0.9 : 1;
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => animateSpeaking(true);
    utterance.onend = () => {
        isSpeaking = false;
        animateSpeaking(false);
        setTimeout(() => { if (userProfile.preferences.autoListening) startAutoListening(); }, 400);
    };
    window.speechSynthesis.speak(utterance);
}

function animateSpeaking(active) {
    const avatar = document.querySelector('.image img');
    if (!avatar) return;
    if (active) {
        avatar.classList.add('speaking');
        content.classList.add('jarvis-glow');
    } else {
        avatar.classList.remove('speaking');
        content.classList.remove('jarvis-glow');
    }
}

// --- Greeting Overlay ---
function showGreetingOverlay(greetingText) {
    let overlay = document.getElementById('jarvis-greeting-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'jarvis-greeting-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '20%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.background = 'rgba(30,30,40,0.95)';
        overlay.style.color = '#00ffe7';
        overlay.style.fontSize = '2rem';
        overlay.style.padding = '2rem 3rem';
        overlay.style.borderRadius = '1.5rem';
        overlay.style.boxShadow = '0 0 40px #00ffe7, 0 0 10px #222';
        overlay.style.zIndex = '9999';
        overlay.style.textAlign = 'center';
        overlay.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        document.body.appendChild(overlay);
    }
    overlay.textContent = greetingText;
    overlay.style.display = 'block';
}
function hideGreetingOverlay() {
    const overlay = document.getElementById('jarvis-greeting-overlay');
    if (overlay) overlay.style.display = 'none';
}

function wishMe() {
    const hour = new Date().getHours();
    let greeting = "Hello!";
    if (hour >= 0 && hour < 12) greeting = `Good morning, ${userProfile.name}.`;
    else if (hour >= 12 && hour < 17) greeting = `Good afternoon, ${userProfile.name}.`;
    else greeting = `Good evening, ${userProfile.name}.`;
    const fullGreeting = `${greeting} I am Jarvis, your personal AI assistant. Ready for your command.`;
    showGreetingOverlay(fullGreeting);
    const avatar = document.querySelector('.image img');
    if (avatar) avatar.classList.add('jarvis-greet');
    speak(fullGreeting);
    setTimeout(() => {
        hideGreetingOverlay();
        if (avatar) avatar.classList.remove('jarvis-greet');
    }, 4000);
}

// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = 'en-US';
let isRecognizing = false;

recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};
recognition.onstart = () => {
    isRecognizing = true;
    content.textContent = "Listening...";
    document.body.classList.add('jarvis-listening');
};
recognition.onend = () => {
    isRecognizing = false;
    document.body.classList.remove('jarvis-listening');
    if (userProfile.preferences.autoListening && !isSpeaking) {
        setTimeout(startAutoListening, 500);
    }
};
function startAutoListening() {
    if (!isRecognizing && !isSpeaking) recognition.start();
}

btn.addEventListener('click', () => {
    if (isRecognizing) recognition.stop();
    else recognition.start();
});
window.addEventListener('load', () => {
    if (userProfile.preferences.autoDarkMode) document.body.classList.add('dark-mode');
    wishMe();
    if (userProfile.preferences.autoListening) startAutoListening();
});

// --- Main Command Handler ---
async function takeCommand(message) {
    // OpenAI Insert Command
    if (/^insert\b/.test(message)) {
        await handleOpenAIInsert(message);
        return;
    }
    // Friendly small talk
    if (/\b(hi|hello|hey|jarvis)\b/.test(message)) {
        speak("Hello! How can I help you today?");
        return;
    }
    if (/how are you|how's it going|how do you feel/.test(message)) {
        speak("I'm functioning optimally, thank you for asking!");
        return;
    }
    if (/thank you|thanks/.test(message)) {
        speak("You're welcome!");
        return;
    }
    if (/who are you|what can you do/.test(message)) {
        speak("I am Jarvis, your AI assistant. I can help with information, automation, smart home, and more.");
        return;
    }
    // Sentiment analysis
    const sentiment = analyzeSentiment(message);
    if (sentiment === 'negative') speak("I'm here for you. Let me know if I can help.", 'response');
    // Context-aware conversation
    conversationContext.push({ message });
    if (conversationContext.length > 10) conversationContext.shift();
    // Memory of previous chats
    commandHistory.push(message);
    localStorage.setItem('commandHistory', JSON.stringify(commandHistory));
    // System commands
    if (await handleSystemCommands(message)) return;
    // AI/LLM integration
    const aiResponse = await generateAIResponse(message);
    speak(aiResponse, 'response');
}

// --- OpenAI Insert Command ---
async function handleOpenAIInsert(command) {
    const insertPrompt = command.replace(/^insert\s+/i, '').trim();
    if (!insertPrompt) {
        speak('Please specify what you want to insert.');
        return;
    }
    content.textContent = 'Generating content...';
    try {
        const aiText = await generateAIResponse(insertPrompt);
        content.textContent = aiText;
        speak('Content inserted.');
    } catch (e) {
        content.textContent = '';
        speak('Sorry, I could not generate the content.', 'error');
    }
}

// --- AI/LLM Integration ---
async function generateAIResponse(prompt) {
    const messages = [
        { role: "system", content: `You are JARVIS, an advanced AI assistant. Personality: ${userProfile.preferences.personality}. Respond concisely and professionally.` },
        ...conversationContext.slice(-5).map(ctx => ({ role: "user", content: ctx.message })),
        { role: "user", content: prompt }
    ];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEYS.OPENAI}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages
        })
    });
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// --- Sentiment Analysis (stub) ---
function analyzeSentiment(text) {
    if (/sad|angry|upset|bad|hate/.test(text)) return 'negative';
    if (/happy|great|good|love|awesome/.test(text)) return 'positive';
    return 'neutral';
}

// --- System Commands, Smart Home, Automation, Data Integration ---
async function handleSystemCommands(command) {
    // Weather
    if (/weather|temperature|forecast/.test(command)) {
        await fetchAndSpeakWeather();
        return true;
    }
    // News
    if (/news|headline/.test(command)) {
        await fetchAndSpeakNews();
        return true;
    }
    // Stock
    if (/stock|market|share price/.test(command)) {
        await fetchAndSpeakStockPrice('AAPL');
        return true;
    }
    // Sports
    if (/score|sports|match/.test(command)) {
        await fetchAndSpeakSportsNews();
        return true;
    }
    // Smart Home
    if (/turn on|turn off|light|fan|ac|thermostat/.test(command)) {
        await controlSmartHome(command);
        return true;
    }
    // Schedule/Calendar
    if (/remind|alarm|schedule|calendar|event/.test(command)) {
        await manageCalendar(command);
        return true;
    }
    // Email/Message
    if (/email|send message|sms/.test(command)) {
        await sendEmailOrMessage(command);
        return true;
    }
    // Personality
    if (/switch personality|be (professional|casual|humorous)/.test(command)) {
        setPersonality(command);
        return true;
    }
    // Voice type
    if (/change voice|male voice|female voice|robotic voice/.test(command)) {
        setVoiceType(command);
        return true;
    }
    // Multilingual
    if (/translate|speak (in|to) [a-z]+/.test(command)) {
        await translateAndSpeak(command);
        return true;
    }
    // Code Assistant
    if (/code|debug|explain code|write function/.test(command)) {
        await codeAssistant(command);
        return true;
    }
    // Clipboard
    if (/clipboard|copy|paste/.test(command)) {
        await clipboardAssistant(command);
        return true;
    }
    // File/Application
    if (/open|close|launch/.test(command)) {
        await openApplication(command);
        return true;
    }
    // Security (stub)
    if (/login|logout|secure|lock/.test(command)) {
        await securityAssistant(command);
        return true;
    }
    // Learning Mode
    if (/learn|teach|new command/.test(command)) {
        await learningMode(command);
        return true;
    }
    return false;
}

// --- Real-Time Data Integration ---
async function fetchAndSpeakWeather() {
    content.textContent = 'Fetching weather...';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${API_KEYS.WEATHER}&units=metric`);
    const weatherData = await response.json();
    const temperature = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const weatherMsg = `The current weather in Delhi is ${temperature} degrees Celsius with ${description}.`;
    content.textContent = weatherMsg;
    speak(weatherMsg);
}
async function fetchAndSpeakNews() {
    content.textContent = 'Fetching news...';
    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=in&apiKey=${API_KEYS.NEWS}`);
    const newsData = await response.json();
    const headline = newsData.articles[0]?.title || "No headlines found.";
    const newsMsg = `The latest headline is: ${headline}`;
    content.textContent = newsMsg;
    speak(newsMsg);
}
async function fetchAndSpeakStockPrice(stockSymbol) {
    content.textContent = 'Fetching stock price...';
    const response = await fetch(`https://api.example.com/stock/${stockSymbol}`);
    const stockData = await response.json();
    const stockMsg = `The current price of ${stockSymbol} is $${stockData.price}.`;
    content.textContent = stockMsg;
    speak(stockMsg);
}
async function fetchAndSpeakSportsNews() {
    content.textContent = 'Fetching sports news...';
    const response = await fetch(`https://newsapi.org/v2/top-headlines?category=sports&apiKey=${API_KEYS.NEWS}`);
    const sportsNewsData = await response.json();
    const headline = sportsNewsData.articles[0]?.title || "No sports headlines found.";
    const sportsMsg = `Latest sports headline: ${headline}`;
    content.textContent = sportsMsg;
    speak(sportsMsg);
}

// --- Smart Home Integration (Stub) ---
async function controlSmartHome(command) {
    speak("Smart home control is not yet fully implemented in this web version.");
}
// --- Task Automation (Stub) ---
async function manageCalendar(command) {
    speak("Calendar integration is coming soon.");
}
async function sendEmailOrMessage(command) {
    speak("Email and messaging will be available in a future update.");
}
// --- Multi-Device Sync (Stub) ---
// --- Voiceprint Recognition (Stub) ---
// --- Advanced Security (Stub) ---
async function securityAssistant(command) {
    speak("Advanced security features are not available in this version.");
}
// --- AI Personality Settings ---
function setPersonality(command) {
    if (command.includes('professional')) userProfile.preferences.personality = 'professional';
    else if (command.includes('casual')) userProfile.preferences.personality = 'casual';
    else if (command.includes('humorous')) userProfile.preferences.personality = 'humorous';
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    speak(`Personality switched to ${userProfile.preferences.personality}.`);
}
function setVoiceType(command) {
    if (command.includes('female')) userProfile.preferences.voiceType = 'female';
    else if (command.includes('male')) userProfile.preferences.voiceType = 'male';
    else if (command.includes('robotic')) userProfile.preferences.voiceType = 'robotic';
    else userProfile.preferences.voiceType = 'default';
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    window.speechSynthesis.onvoiceschanged();
    speak(`Voice type changed to ${userProfile.preferences.voiceType}.`);
}
// --- Learning Mode (Stub) ---
async function learningMode(command) {
    speak("Learning mode is not yet implemented.");
}
// --- Code Assistant Mode (Stub) ---
async function codeAssistant(command) {
    speak("Code assistant mode is coming soon.");
}
// --- Clipboard Assistant (Stub) ---
async function clipboardAssistant(command) {
    speak("Clipboard assistant is not available in this version.");
}
// --- Multilingual Support (Stub) ---
async function translateAndSpeak(command) {
    speak("Multilingual support is coming soon.");
}
// --- File/Application Control (Stub) ---
async function openApplication(command) {
    speak("Application control is not available in this web version.");
}
// --- Proactive Assistance ---
function proactiveAssistance() {
    const hour = new Date().getHours();
    if (hour === 8 && !commandHistory.includes('schedule')) {
        speak("Would you like to review today's schedule?", 'reminder');
    }
}
setInterval(proactiveAssistance, 3600000);
// --- UI Controls ---
document.querySelector('.weather-btn')?.addEventListener('click', fetchAndSpeakWeather);
document.querySelector('.news-btn')?.addEventListener('click', fetchAndSpeakNews);
document.querySelector('.stock-btn')?.addEventListener('click', () => fetchAndSpeakStockPrice('AAPL'));
document.querySelector('.sports-news-btn')?.addEventListener('click', fetchAndSpeakSportsNews);
document.querySelector('.dark-mode-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    userProfile.preferences.autoDarkMode = !userProfile.preferences.autoDarkMode;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    speak("Dark mode toggled.", 'acknowledge');
});
// --- Exported for future modules ---
window.jarvis = {
    speak,
    takeCommand,
    setPersonality,
    setVoiceType
};

