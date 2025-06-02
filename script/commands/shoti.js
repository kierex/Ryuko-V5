const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "shoti",
  version: "1.0.0",
  permission: 0,
  credits: "converted by vrax",
  description: "Get a random TikTok (Shoti) video",
  prefix: false,
  premium: false,
  category: "video",
  usages: "shoti",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    processing: "📲 Fetching random TikTok video...",
    error: "❌ Failed to load TikTok video. Please try again later."
  }
};

module.exports.run = async function ({ api, event, getText }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const filePath = __dirname + "/cache/shoti.mp4";

  try {
    api.sendMessage(getText("processing"), threadID, messageID);

    const res = await axios.get("https://rapido.zetsu.xyz/api/shoti");
    const videoUrl = res.data.url;

    const videoStream = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(filePath, Buffer.from(videoStream, "utf-8"));

    return api.sendMessage(
      { body: "🎬 Here's a random TikTok video:", attachment: fs.createReadStream(filePath) },
      threadID,
      () => fs.unlinkSync(filePath),
      messageID
    );
  } catch (error) {
    console.error("Shoti command error:", error);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
