const axios = require("axios");
const fs = require("fs");

const SESSIONS_FILE = __dirname + "/gagstock_sessions.json";

module.exports.config = {
  name: "gagstock",
  version: "2.0.0",
  permission: 0,
  credits: "you",
  prefix: false,
  premium: false,
  description: "Track Grow A Garden stock & weather with updates.",
  category: "Tools",
  usages: "gagstock on [interval] | gagstock off",
  cooldowns: 3,
};

const activeSessions = new Map();

// Load persisted sessions on start
if (fs.existsSync(SESSIONS_FILE)) {
  const saved = JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8"));
  for (const id in saved) {
    activeSessions.set(id, saved[id]);
  }
}

const saveSessions = () => {
  const plain = {};
  for (const [id, session] of activeSessions.entries()) {
    plain[id] = { lastCombinedKey: session.lastCombinedKey, lastMessage: session.lastMessage };
  }
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(plain, null, 2));
};

module.exports.languages = {
  english: {
    start: "✅ Gagstock tracking started. You’ll get updates every %1 seconds!",
    stop: "🛑 Gagstock tracking stopped.",
    alreadyOn: "⚠️ You are already tracking Gagstock.",
    notTracking: "⚠️ You're not tracking Gagstock.",
    usage: "📌 Usage:\n• gagstock on [interval]\n• gagstock off"
  },
  bangla: {
    start: "✅ গ্যাগস্টক ট্র্যাকিং চালু হয়েছে। আপনি প্রতি %1 সেকেন্ডে আপডেট পাবেন!",
    stop: "🛑 গ্যাগস্টক ট্র্যাকিং বন্ধ হয়েছে।",
    alreadyOn: "⚠️ আপনি ইতিমধ্যেই ট্র্যাক করছেন।",
    notTracking: "⚠️ আপনি এখন ট্র্যাক করছেন না।",
    usage: "📌 ব্যবহার:\n• gagstock on [second]\n• gagstock off"
  }
};

module.exports.run = async ({ api, event, args, getText }) => {
  const { threadID, messageID, senderID } = event;
  const lang = global.config.language || "english";
  const intervalSec = parseInt(args[1]) || 30;

  const send = (msg) => api.sendMessage(msg, threadID, messageID);

  if (args[0] === "off") {
    const session = activeSessions.get(senderID);
    if (session && session.intervalId) {
      clearInterval(session.intervalId);
      activeSessions.delete(senderID);
      saveSessions();
      return send(getText("stop"));
    } else {
      return send(getText("notTracking"));
    }
  }

  if (args[0] !== "on") return send(getText("usage"));

  if (activeSessions.has(senderID)) return send(getText("alreadyOn"));

  send(getText("start", intervalSec));

  const getPHTime = (timestamp) =>
    new Date(timestamp).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      weekday: "short",
    });

  const sessionData = {
    lastCombinedKey: null,
    lastMessage: "",
    intervalId: null
  };

  const fetchData = async () => {
    try {
      const [gearSeedRes, eggRes, weatherRes, honeyStockRes] = await Promise.all([
        axios.get("https://growagardenstock.com/api/stock?type=gear-seeds"),
        axios.get("https://growagardenstock.com/api/stock?type=egg"),
        axios.get("https://growagardenstock.com/api/stock/weather"),
        axios.get("http://65.108.103.151:22377/api/stocks?type=honeyStock")
      ]);

      const gear = gearSeedRes.data;
      const egg = eggRes.data;
      const weather = weatherRes.data;
      const honey = honeyStockRes.data;

      const combinedKey = JSON.stringify({
        gear: gear.gear,
        seeds: gear.seeds,
        egg: egg.egg,
        weather: weather.updatedAt,
        honey: honey.updatedAt
      });

      if (combinedKey === sessionData.lastCombinedKey) return;

      sessionData.lastCombinedKey = combinedKey;

      const now = Date.now();
      const gearReset = Math.max(300 - Math.floor((now - gear.updatedAt) / 1000), 0);
      const eggReset = Math.max(600 - Math.floor((now - egg.updatedAt) / 1000), 0);

      const message =
        `🌾 𝗚𝗿𝗼𝘄 𝗔 𝗚𝗮𝗿𝗱𝗲𝗻 — 𝗨𝗽𝗱𝗮𝘁𝗲\n\n` +
        `🛠️ 𝗚𝗲𝗮𝗿:\n${gear.gear?.join("\n") || "No gear"}\n\n` +
        `🌱 𝗦𝗲𝗲𝗱𝘀:\n${gear.seeds?.join("\n") || "No seeds"}\n\n` +
        `🥚 𝗘𝗴𝗴𝘀:\n${egg.egg?.join("\n") || "No eggs"}\n\n` +
        `🌤️ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿: ${weather.icon || "🌥️"} ${weather.currentWeather}\n🪴 𝗕𝗼𝗻𝘂𝘀: ${weather.cropBonuses || "N/A"}\n\n` +
        `📦 𝗛𝗼𝗻𝗲𝘆:\n${honey.honeyStock.map(h => `🍯 ${h.name}: ${h.value}`).join("\n") || "N/A"}\n\n` +
        `⏱ 𝗚𝗲𝗮𝗿 Reset: ${Math.floor(gearReset / 60)}m ${gearReset % 60}s\n` +
        `⏱ 𝗘𝗴𝗴 Reset: ${Math.floor(eggReset / 60)}m ${eggReset % 60}s`;

      if (message !== sessionData.lastMessage) {
        sessionData.lastMessage = message;
        await send(message);
      }

      saveSessions();
    } catch (err) {
      console.error(`❌ Error fetching stock for ${senderID}: ${err.message}`);
    }
  };

  sessionData.intervalId = setInterval(fetchData, intervalSec * 1000);
  activeSessions.set(senderID, sessionData);
  fetchData();
};
