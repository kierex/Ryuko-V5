const axios = require("axios");

module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  permission: 0,
  credits: "kaiz API by vraxyxx",
  description: "Search for Pinterest images.",
  prefix: false,
  premium: false,
  category: "image",
  usages: "[keyword]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    missingKeyword: "❌ Please enter a keyword to search.",
    processing: "🔍 Searching Pinterest...",
    error: "⚠️ Failed to fetch data from Pinterest."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage(getText("missingKeyword"), threadID, messageID);
  }

  try {
    api.sendMessage(getText("processing"), threadID, async () => {
      const res = await axios.get(`https://kaiz-apis.gleeze.com/api/pinterest`, {
        params: {
          search: query,
          apikey: "d70a144b-54ff-41de-a025-73aadd69e30c"
        }
      });

      const image = res.data.result;
      if (!image) {
        return api.sendMessage(getText("error"), threadID, messageID);
      }

      const stream = (await axios.get(image, { responseType: "stream" })).data;
      return api.sendMessage({ attachment: stream }, threadID, messageID);
    });
  } catch (err) {
    console.error("Pinterest command error:", err.message);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
