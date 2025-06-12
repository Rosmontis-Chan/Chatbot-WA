const axios = require("axios");

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.API_KEY;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

async function sendToOpenRouter(message) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "mistral/mistral-7b-instruct",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      { headers }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    return "Maaf, ada error dari AI 🥲";
  }
}

module.exports = { sendToOpenRouter };
