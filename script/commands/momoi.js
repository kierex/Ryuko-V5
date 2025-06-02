const axios = require("axios");

module.exports.config = {
  name: "momoi",
  version: "1.0.0",
  permission: 0,
  credits: "converted by vrax",
  description: "Generate an image with Momoi saying your text",
  prefix: false,
  premium: false,
  category: "image",
  usages: "momoi [your text]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    missingText: "⚠️ Please provide a message.\nExample: momoi Hello!",
    error: "❌ Failed to generate image from Momoi API.",
    processing: "🖼️ Generating Momoi image..."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const text = args.join(" ");
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!text) {
    return api.sendMessage(getText("missingText"), threadID, messageID);
  }

  api.sendMessage(getText("processing"), threadID, messageID);

  try {
    const apiUrl = `https://zaikyoov3-up.up.railway.app/api/momoi?text=${encodeURIComponent(text)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    return api.sendMessage(
      {
        body: "💬 Momoi says:",
        attachment: Buffer.from(response.data, "utf-8")
      },
      threadID,
      messageID
    );
  } catch (error) {
    console.error("Momoi command error:", error);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
