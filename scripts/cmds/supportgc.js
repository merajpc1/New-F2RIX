module.exports = {
  config: {
    name: "supportgc",
    aliases: ["support", "sgc"],
    version: "1.0.0",
    author: "Azadx69x",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Join the X69X support group" },
    longDescription: { en: "Adds you to the official X69X BOT V3 support group." },
    category: "group",
    guide: { en: "{p}supportgc" },
  },

  onStart: async function ({ api, event }) {
    const SUPPORT_GC = "1229038958739377";
    const { threadID, messageID, senderID } = event;

    try {
      const [userInfo, threadInfo] = await Promise.all([
        api.getUserInfo(senderID),
        api.getThreadInfo(SUPPORT_GC),
      ]);

      const userName = userInfo[senderID]?.name || "Unknown";
      const already = threadInfo.participantIDs.includes(senderID);

      if (already) {
        return api.sendMessage(
          `💬 𝐒𝐮𝐩𝐩𝐨𝐫𝐭 𝐆𝐫𝐨𝐮𝐩

👤 𝐍𝐚𝐦𝐞: ${userName}
📌 𝐒𝐭𝐚𝐭𝐮𝐬: Already a member!

✅ You're already in the support group.
Check your message requests or spam folder if you can't find it.`,
          threadID, messageID
        );
      }

      api.addUserToGroup(senderID, SUPPORT_GC, (err) => {
        if (err) {
          return api.sendMessage(
            `❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐀𝐝𝐝

👤 𝐍𝐚𝐦𝐞: ${userName}
🆔 𝐔𝐬𝐞𝐫 𝐈𝐃: ${senderID}

⚠️ Could not add you to the support group.
Your account might be private or has message requests blocked.
Please try enabling message requests and try again.`,
            threadID, messageID
          );
        }

        api.sendMessage(
          `✅ 𝐀𝐝𝐝𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!

👤 𝐍𝐚𝐦𝐞: ${userName}
🆔 𝐔𝐬𝐞𝐫 𝐈𝐃: ${senderID}

🎉 Welcome to the X69X BOT V3 Support Group!
Feel free to ask anything — we're happy to help.`,
          threadID, messageID
        );

        api.sendMessage(
          `🔔 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫 𝐉𝐨𝐢𝐧𝐞𝐝!

👤 𝐍𝐚𝐦𝐞: ${userName}
🆔 𝐔𝐬𝐞𝐫 𝐈𝐃: ${senderID}

👋 Welcome them to the group!`,
          SUPPORT_GC
        );
      });

    } catch (err) {
      api.sendMessage(
        `❌ 𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠

⚠️ Failed to process your request.
Please try again in a moment.`,
        threadID, messageID
      );
    }
  },
};
