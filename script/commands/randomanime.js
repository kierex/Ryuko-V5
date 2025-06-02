const axios = require("axios");

module.exports.config = {
  name: "randomanime",
  version: "1.0.0",
  permission: 0,
  credits: "kaiz API by vraxyxx",
  description: "Fetch random anime info or images.",
  prefix: false,
  premium: false,
  category: "anime",
  usages: "[page] [limit]",
  cooldowns: 5
};

module.exports.languages = {
  english: {
    loading: "🎌 Fetching random anime...",
    error: "⚠️ Failed to fetch anime data.",
    missing: "⚠️ Unable to get anime info at the moment."
  }
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID } = event;
  const page = args[0] || 1;
  const limit = args[1] || 1;

  try {
    api.sendMessage(getText("loading"), threadID, async () => {
      const response = await axios.get("https://kaiz-apis.gleeze.com/api/random-anime", {
        params: {
          page,
          limit,
          apikey: "d70a144b-54ff-41de-a025-73aadd69e30c"
        }
      });

      const anime = response.data.result?.[0];

      if (!anime) {
        return api.sendMessage(getText("missing"), threadID, messageID);
      }

      const msg = `🎞️ Title: ${anime.title || "N/A"}\n📝 Synopsis: ${anime.synopsis || "No synopsis."}`;
      const imageStream = (await axios.get(anime.image, { responseType: "stream" })).data;

      return api.sendMessage({ body: msg, attachment: imageStream }, threadID, messageID);
    });
  } catch (err) {
    console.error("randomanime command error:", err.message);
    return api.sendMessage(getText("error"), threadID, messageID);
  }
};
