const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "billboard",
  version: "1.0.1",
  permission: 0,
  credits: "vrax",
  prefix: false,
  premium: false,
  description: "Comment on billboard image ( ͡° ͜ʖ ͡°)",
  category: "edit-img",
  usages: "[text]",
  cooldowns: 5,
  dependencies: {
    "canvas": "",
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.languages = {
  "english": {
    "noInput": "Please enter a message to put on the billboard."
  },
  "bangla": {
    "noInput": "বিলবোর্ডে প্রদর্শনের জন্য একটি বার্তা লিখুন।"
  }
};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText('W').width > maxWidth) return resolve(null);

    const words = text.split(' ');
    const lines = [];
    let line = '';

    while (words.length > 0) {
      let split = false;

      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);

        if (split) {
          words[1] = `${temp.slice(-1)}${words[1]}`;
        } else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }

      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        lines.push(line.trim());
        line = '';
      }

      if (words.length === 0) lines.push(line.trim());
    }

    return resolve(lines);
  });
};

module.exports.run = async function ({ api, event, args, getText }) {
  const { threadID, messageID, senderID } = event;

  const text = args.join(" ");
  if (!text) return api.sendMessage(getText("noInput"), threadID, messageID);

  const avatarPath = __dirname + "/cache/avt.png";
  const outputPath = __dirname + "/cache/billboard.png";

  try {
    const userInfo = (await api.getUserInfo(senderID))[senderID];
    const userName = userInfo.name;
    const userAvatarUrl = userInfo.thumbSrc;

    const avatarData = (await axios.get(userAvatarUrl, { responseType: 'arraybuffer' })).data;
    const billboardData = (await axios.get("https://imgur.com/uN7Sllp.png", { responseType: 'arraybuffer' })).data;

    fs.writeFileSync(avatarPath, Buffer.from(avatarData, "utf-8"));
    fs.writeFileSync(outputPath, Buffer.from(billboardData, "utf-8"));

    const avatarImg = await loadImage(avatarPath);
    const baseImg = await loadImage(outputPath);
    const canvas = createCanvas(baseImg.width, baseImg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImg, 10, 10, canvas.width, canvas.height);
    ctx.drawImage(avatarImg, 148, 75, 110, 110);

    ctx.font = "800 23px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "start";
    ctx.fillText(userName, 280, 110);

    ctx.font = "400 23px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "start";

    let fontSize = 55;
    while (ctx.measureText(text).width > 600) {
      fontSize--;
      ctx.font = `400 ${fontSize}px Arial, sans-serif`;
    }

    const lines = await this.wrapText(ctx, text, 250);
    ctx.fillText(lines.join("\n"), 280, 145);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(outputPath, imageBuffer);
    fs.removeSync(avatarPath);

    return api.sendMessage(
      { attachment: fs.createReadStream(outputPath) },
      threadID,
      () => fs.unlinkSync(outputPath),
      messageID
    );
  } catch (error) {
    console.error("Billboard error:", error);
    return api.sendMessage("An error occurred while generating the image.", threadID, messageID);
  }
};
