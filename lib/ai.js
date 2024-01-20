const { GoogleGenerativeAI } = require("@google/generative-ai");
const { apiKeys } = require("../config");
const axios = require("axios");
const Replicate = require("replicate");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(apiKeys.gemini);
const replicate = new Replicate({
  auth: apiKeys.replicate
})

async function generative(prompt) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}

async function generateImage(prompt) {
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt
      }
    }
  );
  const resImage = await axios.get(output[0], {
    responseType: "arraybuffer"
  });
  const buffer = Buffer.from(resImage.data);
  return buffer;
}

module.exports = {
  generative,
  generateImage
}
