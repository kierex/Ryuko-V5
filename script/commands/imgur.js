const axios = require('axios');

module.exports.config = {
  name: "faceswap",
  version: "1.0.1",
  permission: 0,
  credits: "vrax (fixed by ChatGPT)",
  description: "Swap faces in an image using kaiz-apis",
  prefix: false,
  premium: false,
  category: "no prefix",
  usages: "[reply with image]",
  cooldowns: 9
};

module.exports.run = async function({ api, event }) {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0 || event.messageReply.attachments[0].type !== 'photo') {
      return api.sendMessage("❌ Please reply to an image that you want to use for face swap.", event.threadID, event.messageID);
    }

    const imageUrl = encodeURIComponent(event.messageReply.attachments[0].url);
    const apiKey = "d70a144b-54ff-41de-a025-73aadd69e30c";
    const swapApi = `https://kaiz-apis.gleeze.com/api/faceswap?baseUrl=${imageUrl}&swapUrl=${imageUrl}&apikey=${apiKey}`;

    const res = await axios.get(swapApi);

    if (res.data && res.data.url) {
      return api.sendMessage({ body: "✅ Face swapped image:", attachment: await global.utils.getStreamFromURL(res.data.url) }, event.threadID, event.messageID);
    } else {
      return api.sendMessage("❌ Failed to retrieve image from API.", event.threadID, event.messageID);
    }

  } catch (error) {
    console.error("FaceSwap Error:", error.message || error);
    return api.sendMessage("⚠️ Unexpected error occurred while calling the API.", event.threadID, event.messageID);
  }
};
