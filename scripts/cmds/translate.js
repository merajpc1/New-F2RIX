const axios = require("axios");

const baseApi = "https://azadx69x-all-apis-top.vercel.app/api/translate";

async function translateAndSendMessage(content, lang, message, getLang) {
    try {
        const response = await axios.get(`${baseApi}?text=${encodeURIComponent(content)}&to=${encodeURIComponent(lang)}`);
        const translated = response.data?.translated || "❌ 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧 𝐟𝐚𝐢𝐥𝐞𝐝!";

        const replyMsg =
`🐦 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧 🐦

📝 𝐎𝐫𝐢𝐠𝐢𝐧𝐚𝐥:
   ${content}
🌐 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐞𝐝 (${lang}):
   ${translated}`;

        await message.reply(replyMsg);
    } catch (err) {
        console.error(err);
        await message.reply("❌ 𝐄𝐫𝐫𝐨𝐫: 𝐓𝐫𝐚𝐧𝐬𝐥𝐚𝐭𝐢𝐨𝐧 𝐟𝐚𝐢𝐥𝐞𝐝!");
    }
}

module.exports = {
  config: {
    name: "translate",
    aliases: ["trans"],
    version: "0.2.1",
    role: 0,
    author: "Azadx69x",
    category: "utility",
    cooldowns: 3
  },

  onStart: async function ({ message, event, args, threadsData, getLang, commandName }) {
    const { body = "" } = event;
    let content;
    let langCodeTrans;
    const langOfThread = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;

    if (args[0] && ["-r", "-react", "-reaction"].includes(args[0])) {
      if (args[1] == "set") {
        return message.reply(getLang("inputEmoji"), (err, info) =>
          global.GoatBot.onReaction.set(info.messageID, {
            type: "setEmoji",
            commandName,
            messageID: info.messageID,
            authorID: event.senderID
          })
        );
      }
      const isEnable = args[1] == "on" ? true : args[1] == "off" ? false : null;
      if (isEnable == null) return message.reply(getLang("invalidArgument"));
      await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");
      return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));
    }

    if (event.messageReply) {
      content = event.messageReply.body;
      let lastIndexSeparator = body.lastIndexOf("->");
      if (lastIndexSeparator == -1) lastIndexSeparator = body.lastIndexOf("=>");

      if (lastIndexSeparator != -1 && (body.length - lastIndexSeparator == 4 || body.length - lastIndexSeparator == 5))
        langCodeTrans = body.slice(lastIndexSeparator + 2);
      else if ((args[0] || "").match(/\w{2,3}/))
        langCodeTrans = args[0].match(/\w{2,3}/)[0];
      else
        langCodeTrans = langOfThread;
    } else {
      content = event.body;
      let lastIndexSeparator = content.lastIndexOf("->");
      if (lastIndexSeparator == -1) lastIndexSeparator = content.lastIndexOf("=>");

      if (lastIndexSeparator != -1 && (content.length - lastIndexSeparator == 4 || content.length - lastIndexSeparator == 5)) {
        langCodeTrans = content.slice(lastIndexSeparator + 2);
        content = content.slice(content.indexOf(args[0]), lastIndexSeparator);
      } else langCodeTrans = langOfThread;
    }

    if (!content) return message.SyntaxError();
    translateAndSendMessage(content, langCodeTrans, message, getLang);
  },

  onChat: async ({ event, threadsData }) => {
    if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction"))
      return;
    global.GoatBot.onReaction.set(event.messageID, {
      commandName: 'translate',
      messageID: event.messageID,
      body: event.body,
      type: "translate"
    });
  },

  onReaction: async ({ message, Reaction, event, threadsData, getLang }) => {
    switch (Reaction.type) {
      case "setEmoji": {
        if (event.userID != Reaction.authorID) return;
        const emoji = event.reaction;
        if (!emoji) return;
        await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
        return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));
      }
      case "translate": {
        const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🌐";
        if (event.reaction == emojiTrans) {
          const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
          const content = Reaction.body;
          Reaction.delete();
          translateAndSendMessage(content, langCodeTrans, message, getLang);
        }
      }
    }
  }
};
