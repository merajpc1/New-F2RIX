const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "islamicvideo",
    aliases: ["islamicvd"],
    version: "3.1",
    author: "Azadx69x",
    role: 0,
    shortDescription: "Send a random Islamic video",
    category: "islamic",
    guide: { en: "{pn}" }
  },

  onStart: async function({ message, api, event }) {
    let loadingID;

    try {
      const loadingMsg = await message.reply("⏳ 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐘𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨...");
      loadingID = loadingMsg.messageID;

      const RAW_URL = "https://raw.githubusercontent.com/noobcore404/NC-STORE/main/NCApiUrl.json";
      const rawRes = await axios.get(RAW_URL, { timeout: 15000 });
      const rawData = typeof rawRes.data === "string" ? JSON.parse(rawRes.data) : rawRes.data;

      const BASE_API = rawData.islamic;
      if (!BASE_API) throw new Error("Base API not found in RAW");

      const apiUrl = `${BASE_API}/api/video`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });
      if (!data?.info) throw new Error("No video URL returned");

      const videoUrl = data.info;
      const filePath = path.join(__dirname, `islamic_${Date.now()}.mp4`);

      const writer = fs.createWriteStream(filePath);
      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream"
      });
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: "🌙📖 𝐘𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 🌸✨",
          attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);
        if (loadingID) await api.unsendMessage(loadingID);
      });

      writer.on("error", async () => {
        if (loadingID) await api.unsendMessage(loadingID);
        message.reply("❌ 𝐄𝐫𝐫𝐨𝐫 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐕𝐢𝐝𝐞𝐨!");
      });

    } catch (err) {
      console.error("IslamicVideo Error:", err.message);
      if (loadingID) await api.unsendMessage(loadingID);
      message.reply("❌ 𝐕𝐢𝐝𝐞𝐨 𝐋𝐨𝐚𝐝 𝐅𝐚𝐢𝐥𝐞𝐝\n🔁 𝐏𝐥𝐞𝐚𝐬𝐞 𝐓𝐫𝐲 𝐀𝐠𝐚𝐢𝐧");
    }
  }
};
