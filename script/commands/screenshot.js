const axios = require("axios");

module.exports.config = {
  name: "screenshot",
  version: "1.0.0",
  permission: 0,
  credits: "kaiz API by vraxyxx",
  description: "Take a screenshot of any website.",
  prefix: false,
  premium: false,
  category: "utility",
  usages: "[website URL]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    missingUrl: "❌ Please provide a website URL to screenshot.\nExample: screenshot https://example.com",
    processing: "📸 Taking screenshot, please wait...",
    error: "⚠️ Failed to take screenshot from API."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const inputUrl = args.join(" ");

  if (!inputUrl) {
    return api.sendMessage(getText("missingUrl"), threadID, messageID);
  }

  try {
    api.sendMessage(getText("processing"), threadID, async () => {
      const response = await axios.get("https://kaiz-apis.gleeze.com/api/screenshot", {
        params: {
          url: inputUrl,
          apikey: "d70a144b-54ff-41de-a025-73aadd69e30c"
        }
      });

      const imageUrl = response.data.result;
      if (!imageUrl) {
        return api.sendMessage(getText("error"), threadID, messageID);
      }

      const stream = (await axios.get(imageUrl, { responseType: "stream" })).data;
      return api.sendMessage({ attachment: stream }, threadID, messageID);
    });
  } catch (err) {
    console.error("Screenshot command error:", err.message);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
