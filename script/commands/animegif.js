const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "animegif",
  version: "1.0.0",
  permission: 0,
  credits: "converted by vrax",
  description: "Sends a random anime GIF",
  prefix: false,
  premium: false,
  category: "anime",
  usages: "animegif",
  cooldowns: 3
};

module.exports.languages = {
  english: {
    processing: "🔄 Fetching anime GIF...",
    error: "❌ Couldn't fetch an anime GIF at the moment. Try again later."
  }
};

module.exports.run = async function ({ api, event, getText }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  try {
    api.sendMessage(getText("processing"), threadID, messageID);

    const res = await axios.get(`https://rapido.zetsu.xyz/api/animegif`);
    const gifUrl = res.data.url;

    const gifPath = __dirname + "/cache/anime.gif";
    const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(gifPath, Buffer.from(response.data, "utf-8"));

    return api.sendMessage(
      {
        body: "✨ Here's your anime GIF!",
        attachment: fs.createReadStream(gifPath)
      },
      threadID,
      () => fs.unlinkSync(gifPath),
      messageID
    );
  } catch (error) {
    console.error("animegif command error:", error);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
