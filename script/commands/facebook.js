const axios = require("axios");

module.exports.config = {
  name: "facebook",
  version: "1.0.0",
  permission: 0,
  credits: "converted by vrax",
  description: "Download Facebook video from link",
  prefix: false,
  premium: false,
  category: "media",
  usages: "facebook [url]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    missingUrl: "⚠️ Please provide a Facebook video URL.",
    error: "❌ Failed to fetch Facebook video.",
    downloading: "📥 Downloading Facebook video..."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const url = args[0];
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!url || !url.includes("facebook.com")) {
    return api.sendMessage(getText("missingUrl"), threadID, messageID);
  }

  api.sendMessage(getText("downloading"), threadID, messageID);

  try {
    const apiUrl = `https://zaikyoov3-up.up.railway.app/api/facebook?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.result || !response.data.result.sd) {
      return api.sendMessage(getText("error"), threadID, messageID);
    }

    return api.sendMessage(
      {
        body: "🎬 Here's your Facebook video:",
        attachment: await global.utils.getStreamFromURL(response.data.result.sd)
      },
      threadID,
      messageID
    );
  } catch (error) {
    console.error("Facebook command error:", error);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
