const axios = require("axios");

module.exports.config = {
  name: "aria",
  version: "1.0.0",
  permission: 0,
  credits: "converted by vrax",
  description: "Talk with Aria AI",
  prefix: false,
  premium: false,
  category: "ai",
  usages: "aria <prompt>",
  cooldowns: 3
};

module.exports.languages = {
  english: {
    missingPrompt: "⚠️ Please enter your message.\n\nUsage: aria <your message>",
    processing: "💬 Talking to Aria...",
    error: "❌ Failed to get a response from Aria."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const threadID = event.threadID;
  const messageID = event.messageID;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage(getText("missingPrompt"), threadID, messageID);
  }

  try {
    api.sendMessage(getText("processing"), threadID, messageID);

    const res = await axios.get(`https://rapido.zetsu.xyz/api/aria?prompt=${encodeURIComponent(prompt)}`);
    const reply = res.data.reply || getText("error");

    return api.sendMessage(reply, threadID, messageID);
  } catch (error) {
    console.error("Aria command error:", error);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
