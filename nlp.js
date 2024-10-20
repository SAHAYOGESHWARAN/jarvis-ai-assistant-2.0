const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Store your API key in an environment variable
});
const openai = new OpenAIApi(configuration);

async function getResponse(prompt) {
    const response = await openai.createCompletion({
        model: "text-davinci-003", // Use GPT-4 for more advanced models
        prompt: prompt,
        max_tokens: 150,
    });

    return response.data.choices[0].text.trim();
}

module.exports = { getResponse };
