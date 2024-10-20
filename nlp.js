const OpenAI = require("openai");

console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY); // Debugging line

const openai = new OpenAI({
    apiKey: 'sk-4A2eKp1A7dEfghijklmnopQRsTUVwxyz1234567890', // Replace with your actual key
});


async function getResponse(prompt) {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use gpt-4 if you have access
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
    });

    return response.choices[0].message.content.trim();
}

module.exports = { getResponse };
