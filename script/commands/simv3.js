const fs = require("fs");

module.exports.config = {
  name: "sim",
  version: "1.1.0",
  permission: 0,
  credits: "Yan Maglinte",
  description: "Chat with SIM AI using custom responses.",
  prefix: false,
  premium: false,
  category: "chatbots",
  usages: "[message]",
  cooldowns: 2
};

module.exports.languages = {
  english: {
    noInput: "Please type a message...",
    notAdmin: "❌ You are not authorized to use this function!",
    added: (word, res) => `✅ Added "${word}" with response: "${res}"`,
    deletedRes: (word, res) => `✅ Deleted response "${res}" from "${word}"`,
    deletedAll: (word) => `✅ Deleted all responses for "${word}"`,
    wordNotFound: (word) => `❌ The word "${word}" does not exist.`,
    resNotFound: (res, word) => `❌ The response "${res}" was not found under "${word}"`,
    addOff: "⚠️ Add function is currently deactivated.",
    delOff: "⚠️ Delete function is currently deactivated.",
    noResponse: "ℹ️ I have no response yet. Teach me via cache/DAN/readme.md."
  }
};

module.exports.run = function ({ api, event, args, getText }) {
  const { messageID, threadID, senderID } = event;
  const content = args.join(" ");
  if (!args[0]) return api.sendMessage(getText("noInput"), threadID, messageID);

  try {
    const dataPath = __dirname + "/cache/DAN/dan.json";
    const responses = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    let respond = responses[content.toLowerCase()];

    // Admin commands
    if (content.startsWith("add = ")) {
      if (!global.config.ADMINBOT?.includes(senderID)) return api.sendMessage(getText("notAdmin"), threadID, messageID);
      const toggle = content.substring(6).toLowerCase();
      if (toggle === "on") {
        global.config.ADD_FUNCTION = true;
        respond = "✅ Add function activated.";
      } else if (toggle === "off") {
        global.config.ADD_FUNCTION = false;
        respond = "✅ Add function deactivated.";
      }
    } else if (content.startsWith("del = ")) {
      if (!global.config.ADMINBOT?.includes(senderID)) return api.sendMessage(getText("notAdmin"), threadID, messageID);
      const toggle = content.substring(6).toLowerCase();
      if (toggle === "on") {
        global.config.DEL_FUNCTION = true;
        respond = "✅ Delete function activated.";
      } else if (toggle === "off") {
        global.config.DEL_FUNCTION = false;
        respond = "✅ Delete function deactivated.";
      }
    }

    // Delete response
    else if (content.includes("=!")) {
      const [word, res] = content.split("=!").map(x => x.trim());
      const key = word.toLowerCase();

      if (!global.config.DEL_FUNCTION) return api.sendMessage(getText("delOff"), threadID, messageID);

      if (responses[key]) {
        if (res) {
          const index = responses[key].indexOf(res);
          if (index !== -1) {
            responses[key].splice(index, 1);
            if (responses[key].length === 0) delete responses[key];
            fs.writeFileSync(dataPath, JSON.stringify(responses, null, 4), "utf-8");
            respond = getText("deletedRes", word, res);
          } else {
            respond = getText("resNotFound", res, word);
          }
        } else {
          delete responses[key];
          fs.writeFileSync(dataPath, JSON.stringify(responses, null, 4), "utf-8");
          respond = getText("deletedAll", word);
        }
      } else {
        respond = getText("wordNotFound", word);
      }
    }

    // Add response
    else if (content.includes("=>")) {
      const [word, ...rest] = content.split("=>").map(x => x.trim());
      const response = rest.join("=>");
      const key = word.toLowerCase();

      if (!global.config.ADD_FUNCTION) return api.sendMessage(getText("addOff"), threadID, messageID);

      if (word && response) {
        if (!responses[key]) responses[key] = [];
        if (!responses[key].includes(response)) responses[key].push(response);
        fs.writeFileSync(dataPath, JSON.stringify(responses, null, 4), "utf-8");
        respond = getText("added", word, response);
      }
    }

    // Normal chat response
    if (Array.isArray(respond)) {
      const index = Math.floor(Math.random() * respond.length);
      respond = respond[index];
    } else if (!respond) {
      respond = getText("noResponse");
    }

    return api.sendMessage(respond, threadID, messageID);
  } catch (error) {
    console.error("Sim error:", error);
    return api.sendMessage("❌ An error occurred while processing your request.", threadID, messageID);
  }
};
