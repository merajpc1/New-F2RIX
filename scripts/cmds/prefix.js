const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Prefix manager",
    longDescription: "Control bot prefix (chat/global)",
    category: "system"
  },

  langs: {
    en: {
      askPrefix: "😏 𝐇𝐞𝐲 %name%, 𝐝𝐢𝐝 𝐲𝐨𝐮 𝐚𝐬𝐤 𝐟𝐨𝐫 𝐦𝐲 𝐩𝐫𝐞𝐟𝐢𝐱?\n❯🌐 𝐆𝐥𝐨𝐛𝐚𝐥 ⟿『%global%』\n❯💬 𝐂𝐡𝐚𝐭 ⟿ 『%chat%』\n\n🤖 𝐈'𝐦 𝐗69𝐗 𝐁𝐎𝐓 𝐕3 𝐚𝐭 𝐲𝐨𝐮𝐫 𝐬𝐞𝐫𝐯𝐢𝐜𝐞 👿",
      resetPrefix: "☢️ 𝐏𝐫𝐞𝐟𝐢𝐱 𝐑𝐞𝐬𝐞𝐭\n\n🌐 𝐆𝐥𝐨𝐛𝐚𝐥 ⟿ %global%\n💬 𝐂𝐡𝐚𝐭 ⟿ %global%\n\n🤖 𝐗69𝐗 𝐁𝐎𝐓 𝐕3",
      confirmChange: "♻️ %type% 𝐂𝐡𝐚𝐧𝐠𝐞\n%old% ⇢ %new%\n\n👆 𝐑𝐞𝐚𝐜𝐭 𝐰𝐢𝐭𝐡 ✅ 𝐭𝐨 𝐜𝐨𝐧𝐟𝐢𝐫𝐦",
      updatedGlobal: "✅ 𝐆𝐥𝐨𝐛𝐚𝐥 𝐔𝐩𝐝𝐚𝐭𝐞 ⇢ %prefix%\n\n🤖 𝐗69𝐗 𝐁𝐎𝐓 𝐕3",
      updatedChat: "✅ 𝐂𝐡𝐚𝐭 𝐔𝐩𝐝𝐚𝐭𝐞 ⇢ %prefix%\n\n🤖 𝐗69𝐗 𝐁𝐎𝐓 𝐕3",
      ownerOnly: "⛔ 𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲",
      cancelled: "❌ 𝐂𝐚𝐧𝐜𝐞𝐥𝐥𝐞𝐝"
    }
  },

  onStart: async function ({ api, event, args, threadsData, getLang }) {
    const { threadID, messageID, senderID } = event;

    let name = "User";
    try {
      const data = await api.getUserInfo(senderID);
      name = data[senderID]?.name?.split(" ")[0] || "User";
    } catch {}

    const globalPf = global.GoatBot.config.prefix;
    const threadPf = await threadsData.get(threadID, "data.prefix").catch(() => null);
    const currentPf = threadPf || globalPf;

    if (!args[0]) {
      return api.sendMessage(
        getLang("askPrefix").replace("%name%", name).replace("%global%", globalPf).replace("%chat%", currentPf),
        threadID,
        messageID
      );
    }

    if (args[0].toLowerCase() === "reset") {
      await threadsData.set(threadID, null, "data.prefix");
      return api.sendMessage(
        getLang("resetPrefix").replace(/%global%/g, globalPf),
        threadID,
        messageID
      );
    }

    const nextPf = args[0];
    const isGlobal = args[1] === "-g";

    if (isGlobal && senderID !== api.getCurrentUserID()) {
      return api.sendMessage(getLang("ownerOnly"), threadID, messageID);
    }

    const confirmText = isGlobal
      ? getLang("confirmChange").replace("%type%", "Global").replace("%old%", globalPf).replace("%new%", nextPf)
      : getLang("confirmChange").replace("%type%", "Chat").replace("%old%", currentPf).replace("%new%", nextPf);

    return api.sendMessage(confirmText, threadID, (err, info) => {
      if (err) return;

      global.GoatBot.onReaction.set(info.messageID, {
        messageID: info.messageID,
        commandName: "prefix",
        uid: senderID,
        prefix: nextPf,
        isGlobal: isGlobal,
        threadID: threadID
      });
    }, messageID);
  },

  onReaction: async function ({ api, event, Reaction, threadsData, getLang }) {
    const { userID, messageID, reaction, threadID } = event;

    if (!Reaction || Reaction.uid !== userID) return;

    const normalizedReaction = reaction ? reaction.toString().replace(/\uFE0F/g, '').trim() : '';
    const targetEmoji = "✅";

    const isConfirm = normalizedReaction === targetEmoji ||
                      normalizedReaction === "✓" ||
                      normalizedReaction === "☑" ||
                      normalizedReaction === "✔";

    if (!isConfirm) {
      global.GoatBot.onReaction.delete(messageID);
      return api.sendMessage(getLang("cancelled"), Reaction.threadID, messageID);
    }

    const { prefix, isGlobal } = Reaction;

    global.GoatBot.onReaction.delete(messageID);

    if (isGlobal) {
      global.GoatBot.config.prefix = prefix;
      await fs.writeFile(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return api.sendMessage(getLang("updatedGlobal").replace("%prefix%", prefix), threadID);
    }

    await threadsData.set(threadID, prefix, "data.prefix");
    return api.sendMessage(getLang("updatedChat").replace("%prefix%", prefix), threadID);
  }
};
