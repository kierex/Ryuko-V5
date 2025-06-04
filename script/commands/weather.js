const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "gagstock",
  description: "Get Grow A Garden gear, weather, and honey stock info",
  usage: "gagstock",
  category: "Tools ⚒️",

  async execute(senderId, args, pageAccessToken) {
    try {
      const [gearRes, weatherRes, honeyRes] = await Promise.all([
        axios.get("https://growagardenstock.com/api/stock?type=gear-seeds"),
        axios.get("https://growagardenstock.com/api/stock/weather"),
        axios.get("http://65.108.103.151:22377/api/stocks?type=honeyStock")
      ]);

      const gear = gearRes.data;
      const weather = weatherRes.data;
      const honey = honeyRes.data;

      const gearText = [
        `🛠️ Gear:\n${(gear.gear && gear.gear.length) ? gear.gear.join("\n") : "No gear available."}`,
        `🌱 Seeds:\n${(gear.seeds && gear.seeds.length) ? gear.seeds.join("\n") : "No seeds available."}`
      ].join("\n\n");

      const weatherText = `🌤️ Weather: ${weather.icon || "🌦️"} ${weather.currentWeather || "Unknown"}\n🪴 Bonus: ${weather.cropBonuses || "N/A"}`;

      const honeyList = honey.honeyStock || [];
      const honeyText = honeyList.length
        ? honeyList.map(h => `🍯 ${h.name}: ${h.value}`).join("\n")
        : "No honey stock available.";

      const message = `🌾 Grow A Garden Info:\n\n${gearText}\n\n${weatherText}\n\n📦 Honey Stock:\n${honeyText}`;

      await sendMessage(senderId, { text: message }, pageAccessToken);

    } catch (err) {
      console.error("❌ Gagstock fetch error:", err.message);
      await sendMessage(senderId, {
        text: "❌ Failed to fetch Grow A Garden data. Please try again later."
      }, pageAccessToken);
    }
  }
};
