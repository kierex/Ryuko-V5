module.exports = {
  name: "hello",
  description: "Sends a greeting",
  usage: "hello",
  cooldown: 3,
  category: "fun",

  execute({ api, event }) {
    api.sendMessage("Hello! 👋", event.threadID);
  }
};
