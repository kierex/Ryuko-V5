module.exports.config = {
    name: "war",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "Priyansh Rajput",
    description: "Friendly group war with funny messages",
    commandCategory: "group",
    usages: "war @user",
    cooldowns: 10
}

module.exports.run = async function({ api, event }) {
  const mention = Object.keys(event.mentions)[0];
  if (!mention) return api.sendMessage("Please mention a user to start the friendly war!", event.threadID);

  const messages = [
    "Listen up, warriors!",
    "Prepare yourselves for an epic battle!",
    "Sharpen your words, the war has begun!",
    "Are you ready to rumble?",
    "May the best fighter win!",
    "This is a friendly showdown, no hard feelings!",
    "Remember to have fun!",
    "Warriors, attack!",
    "Victory is near!",
    "Good fight, everyone!",
    "Peace is restored. Until next time!"
  ];

  const send = (msg) => api.sendMessage(msg, event.threadID);

  messages.forEach((msg, i) => {
    setTimeout(() => {
      if (i === 0) send({body: msg, mentions: [{id: mention}]});
      else send(msg);
    }, i * 5000);
  });
}
