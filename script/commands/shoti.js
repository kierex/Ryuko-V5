const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

module.exports.config = {
    name: "shoti",
    version: "1.0.1",
    permission: 0,
    description: "Send a random Shoti video using Haji API",
    prefix: false,
    premium: false,
    credits: "vrax (fixed by me)",
    cooldowns: 10,
    category: "media"
};

module.exports.run = async function ({ api, event }) {
    const apiKey = "d5f543ba40e5c5063b90748d926a3ed784c28e102e083e205052b6a1f427055e";
    const apiUrl = `https://haji-mix.up.railway.app/api/shoti?stream=true&api_key=${apiKey}`;
    const fileName = `${event.messageID}.mp4`;
    const filePath = path.join(__dirname, fileName);

    try {
        const response = await axios.get(apiUrl);
        const data = response.data?.shoti;

        if (!data || !data.videoUrl) {
            return api.sendMessage("❌ Could not retrieve video. Please try again later.", event.threadID, event.messageID);
        }

        const { videoUrl, title, username, nickname, region } = data;

        const downloadResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        downloadResponse.data.pipe(writer);

        writer.on('finish', async () => {
            await api.sendMessage({
                body: `🎬 Title: ${title}\n👤 Username: ${username}\n📛 Nickname: ${nickname}\n🌍 Region: ${region}`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
        });

        writer.on('error', (err) => {
            console.error('Download error:', err);
            fs.unlinkSync(filePath);
            api.sendMessage('❌ Error downloading the video. Please try again later.', event.threadID, event.messageID);
        });

    } catch (error) {
        console.error('API fetch error:', error);
        return api.sendMessage("⚠️ An error occurred while fetching the video.", event.threadID, event.messageID);
    }
};
