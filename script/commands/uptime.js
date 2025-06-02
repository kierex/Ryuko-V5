const axios = require("axios");

module.exports.config = {
  name: "uptime",
  version: "1.0.0",
  permission: 0,
  credits: "kaiz API by vraxyxx",
  description: "Show uptime status via Kaiz API.",
  prefix: false,
  premium: false,
  category: "system",
  usages: "[no args]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    processing: "⏳ Getting uptime information...",
    failed: "❌ Failed to fetch uptime data."
  }
};

module.exports.run = async function ({ api, event, getText }) {
  const { threadID, messageID } = event;

  try {
    api.sendMessage(getText("processing"), threadID, async () => {
      const url = "https://kaiz-apis.gleeze.com/api/uptime" +
        "?instag=vrn.esg&ghub=vraxyxx&fb=vern" +
        "&hours=24/7&minutes=60&seconds=04" +
        "&botname=Kaizbot&apikey=d70a144b-54ff-41de-a025-73aadd69e30c";

      const res = await axios.get(url);
      const data = res.data;

      // Fallback if data is not in expected format
      if (!data || typeof data !== "object" || !data.result) {
        return api.sendMessage(getText("failed"), threadID, messageID);
      }

      return api.sendMessage(data.result, threadID, messageID);
    });
  } catch (err) {
    console.error("Uptime error:", err);
    return api.sendMessage(getText("failed"), threadID, messageID);
  }
};
