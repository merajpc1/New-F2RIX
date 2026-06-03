const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
        const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
        const match = url.match(regex);
        return match ? match[1] : null;
}

function isURL(str) {
        try {
                new URL(str);
                return true;
        }
        catch (e) {
                return false;
        }
}

module.exports = {
        config: {
                name: "cmd",
                version: "1.17",
                author: "NTKhang |Azadx69x",
                countDown: 5,
                role: 4,
                description: {
                        vi: "Quản lý các tệp lệnh của bạn",
                        en: "Manage your command files"
                },
                category: "owner",
                guide: {
                        vi: " {pn} load <tên file lệnh>"
                                + "\n {pn} loadAll"
                                + "\n {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url, url là đường dẫn đến tệp lệnh (raw)"
                                + "\n {pn} install <tên file lệnh> <code>: Tải xuống và cài đặt một tệp lệnh từ một code, code là mã của lệnh",
                        en: " {pn} load <command file name>"
                                + "\n {pn} loadAll"
                                + "\n {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
                                + "\n {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
                }
        },

        langs: {
                vi: {
                        missingFileName: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐍𝐀𝐌𝐄!\n✉️ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝐭𝐞̂𝐧 𝐥𝐞̣̂𝐧𝐡 𝐛𝐚̣𝐧 𝐦𝐮𝐨̂́𝐧 𝐫𝐞𝐥𝐨𝐚𝐝\n",
                        loaded: "\n✓𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐜𝐭𝐢𝐯𝐞\n",
                        loadedError: "\n✖ 𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n⛔ 𝐄𝐫𝐫𝐨𝐫: %2\n✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: %3\n",
                        loadedSuccess: "\n✓𝐋𝐎𝐀𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📊 𝐓𝐨𝐭𝐚𝐥: %1 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐑𝐞𝐚𝐝𝐲\n",
                        loadedFail: "\n✖ 𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃!\n📊 𝐅𝐚𝐢𝐥𝐞𝐝: %1 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n✉️ 𝐄𝐫𝐫𝐨𝐫𝐬:\n%2\n😷 𝐎𝐩𝐞𝐧 𝐜𝐨𝐧𝐬𝐨𝐥𝐞 𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬\n",
                        missingCommandNameUnload: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐍𝐀𝐌𝐄!\n✉️ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝐭𝐞̂𝐧 𝐥𝐞̣̂𝐧𝐡 𝐛𝐚̣𝐧 𝐦𝐮𝐨̂́𝐧 𝐮𝐧𝐥𝐨𝐚𝐝\n",
                        unloaded: "\n✓𝐔𝐍𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐈𝐧𝐚𝐜𝐭𝐢𝐯𝐞\n",
                        unloadedError: "\n✖ 𝐔𝐍𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n⛔ 𝐄𝐫𝐫𝐨𝐫: %2\n✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: %3\n",
                        missingUrlCodeOrFileName: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍!\n✉️ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝐮𝐫𝐥 𝐡𝐨𝐚̣̆𝐜 𝐜𝐨𝐝𝐞\n🔗 𝐕𝐚̀ 𝐭𝐞̂𝐧 𝐟𝐢𝐥𝐞 𝐥𝐞̣̂𝐧𝐡\n",
                        missingUrlOrCode: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐔𝐑𝐋/𝐂𝐎𝐃𝐄!\n✉️ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝐮𝐫𝐥 𝐡𝐨𝐚̣̆𝐜 𝐜𝐨𝐝𝐞 𝐜𝐮̉𝐚 𝐟𝐢𝐥𝐞 𝐥𝐞̣̂𝐧𝐡\n",
                        missingFileNameInstall: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐅𝐈𝐋𝐄 𝐍𝐀𝐌𝐄!\n✉️ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝐭𝐞̂𝐧 𝐟𝐢𝐥𝐞 (.𝐣𝐬) đ𝐞̂̉ 𝐥𝐮̛𝐮 𝐥𝐞̣̂𝐧𝐡\n",
                        invalidUrl: "\n🚨 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐔𝐑𝐋!\n✉️ 𝐕𝐮𝐢 𝐥𝐨̀𝐧𝐠 𝐧𝐡𝐚̣̂𝐩 𝐮𝐫𝐥 𝐡𝐨̛̣𝐩 𝐥𝐞̣̣\n",
                        invalidUrlOrCode: "\n🚨 𝐂𝐀𝐍'𝐓 𝐆𝐄𝐓 𝐂𝐎𝐃𝐄!\n✉️ 𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐢̀𝐦 𝐭𝐡𝐚̂́ 𝐦𝐚̃ 𝐥𝐞̣̂𝐧𝐡 𝐡𝐨𝐚̣̆𝐜 𝐮𝐫𝐥 𝐤𝐡𝐨̂𝐧𝐠 𝐡𝐨̛̣𝐩 𝐥𝐞̣̣\n",
                        installed: "\n✓𝐈𝐍𝐒𝐓𝐀𝐋𝐋𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐜𝐭𝐢𝐯𝐞\n🔁 𝐏𝐚𝐭𝐡: %2\n",
                        installedError: "\n✖ 𝐈𝐍𝐒𝐓𝐀𝐋𝐋 𝐅𝐀𝐈𝐋𝐄𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n⛔ 𝐄𝐫𝐫𝐨𝐫: %2\n✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: %3\n",
                        missingFile: "\n🚨 𝐅𝐈𝐋𝐄 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n✉️ 𝐂𝐡𝐞𝐜𝐤 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐩𝐚𝐭𝐡\n",
                        invalidFileName: "\n🚨 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐅𝐈𝐋𝐄 𝐍𝐀𝐌𝐄!\n📁 𝐅𝐢𝐥𝐞: %1\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐬𝐞 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞\n",
                        unloadedFile: "\n✓𝐔𝐍𝐋𝐎𝐀𝐃𝐄𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐈𝐧𝐚𝐜𝐭𝐢𝐯𝐞\n"
                },
                en: {
                        missingFileName: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐍𝐀𝐌𝐄!\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐚𝐦𝐞 𝐭𝐨 𝐫𝐞𝐥𝐨𝐚𝐝\n",
                        loaded: "\n✓𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐜𝐭𝐢𝐯𝐞\n",
                        loadedError: "\n✖ 𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n⛔ 𝐄𝐫𝐫𝐨𝐫: %2\n✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: %3\n",
                        loadedSuccess: "\n✓𝐋𝐎𝐀𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📊 𝐓𝐨𝐭𝐚𝐥: %1 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐑𝐞𝐚𝐝𝐲\n",
                        loadedFail: "\n✖ 𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃!\n📊 𝐅𝐚𝐢𝐥𝐞𝐝: %1 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n✉️ 𝐄𝐫𝐫𝐨𝐫𝐬:\n%2\n👀 𝐎𝐩𝐞𝐧 𝐜𝐨𝐧𝐬𝐨𝐥𝐞 𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬\n",
                        openConsoleToSeeError: "😷 𝐎𝐩𝐞𝐧 𝐜𝐨𝐧𝐬𝐨𝐥𝐞 𝐟𝐨𝐫 𝐝𝐞𝐭𝐚𝐢𝐥𝐬",
                        missingCommandNameUnload: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐍𝐀𝐌𝐄!\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐚𝐦𝐞 𝐭𝐨 𝐮𝐧𝐥𝐨𝐚𝐝\n",
                        unloaded: "\n✓𝐔𝐍𝐋𝐎𝐀𝐃𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐈𝐧𝐚𝐜𝐭𝐢𝐯𝐞\n",
                        unloadedError: "\n✖ 𝐔𝐍𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n⛔ 𝐄𝐫𝐫𝐨𝐫: %2\n✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: %3\n",
                        missingUrlCodeOrFileName: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍!\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐮𝐫𝐥/𝐜𝐨𝐝𝐞 𝐚𝐧𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞\n",
                        missingUrlOrCode: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐔𝐑𝐋/𝐂𝐎𝐃𝐄!\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐮𝐫𝐥 𝐨𝐫 𝐜𝐨𝐝𝐞 𝐨𝐟 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐢𝐥𝐞\n",
                        missingFileNameInstall: "\n🚨 𝐌𝐈𝐒𝐒𝐈𝐍𝐆 𝐅𝐈𝐋𝐄 𝐍𝐀𝐌𝐄!\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 (.𝐣𝐬) 𝐭𝐨 𝐬𝐚𝐯𝐞 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝\n",
                        invalidUrl: "\n🚨 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐔𝐑𝐋!\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐮𝐫𝐥\n",
                        invalidUrlOrCode: "\n🚨 𝐂𝐀𝐍'𝐓 𝐆𝐄𝐓 𝐂𝐎𝐃𝐄!\n✉️ 𝐂𝐨𝐮𝐥𝐝𝐧'𝐭 𝐫𝐞𝐭𝐫𝐢𝐞𝐯𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐨𝐝𝐞 𝐨𝐫 𝐢𝐧𝐯𝐚𝐥𝐢𝐝 𝐮𝐫𝐥\n",
                        installed: "\n✓𝐈𝐍𝐒𝐓𝐀𝐋𝐋𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐀𝐜𝐭𝐢𝐯𝐞\n🔁 𝐏𝐚𝐭𝐡: %2\n",
                        installedError: "\n✖ 𝐈𝐍𝐒𝐓𝐀𝐋𝐋 𝐅𝐀𝐈𝐋𝐄𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n⛔ 𝐄𝐫𝐫𝐨𝐫: %2\n✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞: %3\n",
                        missingFile: "\n🚨 𝐅𝐈𝐋𝐄 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n✉️ 𝐂𝐡𝐞𝐜𝐤 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐩𝐚𝐭𝐡\n",
                        invalidFileName: "\n🚨 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐅𝐈𝐋𝐄 𝐍𝐀𝐌𝐄!\n📁 𝐅𝐢𝐥𝐞: %1\n✉️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐬𝐞 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐟𝐢𝐥𝐞 𝐧𝐚𝐦𝐞\n",
                        unloadedFile: "\n✓𝐔𝐍𝐋𝐎𝐀𝐃𝐄𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃!\n📁 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: %1\n📶 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐈𝐧𝐚𝐜𝐭𝐢𝐯𝐞\n"
                }
        },

        onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
                const { unloadScripts, loadScripts } = global.utils;

                // Command syntax help
                if (!args[0] || args[0].toLowerCase() === "help") {
                        return message.reply(
                                "\n" +
                                "🚀 𝐗𝟔𝟗𝐗 𝐁𝐎𝐓 - 𝐂𝐌𝐃 𝐌𝐀𝐍𝐀𝐆𝐄𝐑\n\n" +
                                "📋 𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒:\n\n" +
                                "• load <command>\n" +
                                " ↳ Load a single command\n\n" +
                                "• loadAll\n" +
                                " ↳ Load all commands\n\n" +
                                "• unload <command>\n" +
                                " ↳ Unload a command\n\n" +
                                "• install <url> <filename.js>\n" +
                                " ↳ Install from URL\n\n" +
                                "• install <filename.js> <code>\n" +
                                " ↳ Install from code\n\n" +
                                "💡 𝐄𝐗𝐀𝐌𝐏𝐋𝐄𝐒:\n" +
                                "• cmd load admin\n" +
                                "• cmd install admin.js code\n" +
                                "• cmd unload admin\n" +
                                ""
                        );
                }

                if (args[0] == "load" && args.length == 2) {
                        if (!args[1])
                                return message.reply(getLang("missingFileName"));
                        const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
                        if (infoLoad.status == "success")
                                message.reply(getLang("loaded", infoLoad.name));
                        else {
                                message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
                        }
                }
                else if ((args[0] || "").toLowerCase() == "loadall" || (args[0] == "load" && args.length > 2)) {
                        const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
                                fs.readdirSync(__dirname)
                                        .filter(file =>
                                                file.endsWith(".js") &&
                                                !file.match(/(eg)\.js$/g) &&
                                                (process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
                                                !configCommands.commandUnload?.includes(file)
                                        )
                                        .map(item => item = item.split(".")[0]) :
                                args.slice(1);
                        const arraySucces = [];
                        const arrayFail = [];

                        for (const fileName of fileNeedToLoad) {
                                const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
                                if (infoLoad.status == "success")
                                        arraySucces.push(fileName);
                                else
                                        arrayFail.push(`✖ ${fileName} → ${infoLoad.error.name}: ${infoLoad.error.message}`);
                        }

                        let msg = "";
                        if (arraySucces.length > 0)
                                msg += getLang("loadedSuccess", arraySucces.length);
                        if (arrayFail.length > 0) {
                                msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, arrayFail.join("\n"));
                        }

                        message.reply(msg);
                }
                else if (args[0] == "unload") {
                        if (!args[1])
                                return message.reply(getLang("missingCommandNameUnload"));
                        try {
                                const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
                                infoUnload.status == "success" ?
                                        message.reply(getLang("unloaded", infoUnload.name)) :
                                        message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
                        } catch (error) {
                                message.reply(getLang("unloadedError", args[1], error.name, error.message));
                        }
                }
                else if (args[0] == "install") {
                        let url = args[1];
                        let fileName = args[2];
                        let rawCode;

                        if (!url || !fileName)
                                return message.reply(getLang("missingUrlCodeOrFileName"));

                        if (url.endsWith(".js") && !isURL(url)) {
                                const tmp = fileName;
                                fileName = url;
                                url = tmp;
                        }

                        if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
                                global.utils.log.dev("install", "url", url);
                                if (!fileName || !fileName.endsWith(".js"))
                                        return message.reply(getLang("missingFileNameInstall"));

                                const domain = getDomain(url);
                                if (!domain)
                                        return message.reply(getLang("invalidUrl"));

                                if (domain == "pastebin.com") {
                                        const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
                                        if (url.match(regex))
                                                url = url.replace(regex, "https://pastebin.com/raw/$1");
                                        if (url.endsWith("/"))
                                                url = url.slice(0, -1);
                                }
                                else if (domain == "github.com") {
                                        const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
                                        if (url.match(regex))
                                                url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
                                }

                                rawCode = (await axios.get(url)).data;

                                if (domain == "savetext.net") {
                                        const $ = cheerio.load(rawCode);
                                        rawCode = $("#content").text();
                                }
                        }
                        else {
                                global.utils.log.dev("install", "code", args.slice(1).join(" "));
                                if (args[args.length - 1].endsWith(".js")) {
                                        fileName = args[args.length - 1];
                                        rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
                                }
                                else if (args[1].endsWith(".js")) {
                                        fileName = args[1];
                                        rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
                                }
                                else
                                        return message.reply(getLang("missingFileNameInstall"));
                        }

                        if (!rawCode)
                                return message.reply(getLang("invalidUrlOrCode"));

                        // SILENT OVERWRITE - Delete old file if exists (no message)
                        if (fs.existsSync(path.join(__dirname, fileName))) {
                                try {
                                        fs.unlinkSync(path.join(__dirname, fileName));
                                } catch (err) {
                                        // Ignore error
                                }
                        }

                        // Direct install
                        const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
                        infoLoad.status == "success" ?
                                message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
                                message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
                }
                else
                        message.reply(
                                "\n" +
                                "🚨 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃!\n\n" +
                                "✉️ 𝐔𝐬𝐞: 𝐜𝐦𝐝 𝐥𝐨𝐚𝐝/𝐥𝐨𝐚𝐝𝐀𝐥𝐥/𝐢𝐧𝐬𝐭𝐚𝐥𝐥/𝐮𝐧𝐥𝐨𝐚𝐝\n" +
                                "💡 𝐓𝐲𝐩𝐞: 𝐜𝐦𝐝 𝐡𝐞𝐥𝐩 𝐟𝐨𝐫 𝐠𝐮𝐢𝐝𝐞\n" +
                                ""
                        );
        },

        onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
                const { loadScripts } = global.utils;
                const { author, data: { fileName, rawCode } } = Reaction;
                if (event.userID != author)
                        return;
                const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
                infoLoad.status == "success" ?
                        message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
                        message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
        }
};

// do not edit this code because it use for obfuscate code
const packageAlready = [];
const spinner = "\\|/-";
let count = 0;

function loadScripts(folder, fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode) {
        const storageCommandFilesPath = global.GoatBot[folder == "cmds" ? "commandFilesPath" : "eventCommandsFilesPath"];

        try {
                if (rawCode) {
                        fileName = fileName.slice(0, -3);
                        fs.writeFileSync(path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`), rawCode);
                }
                const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
                const { GoatBot } = global;
                const { onFirstChat: allOnFirstChat, onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;
                let setMap, typeEnvCommand, commandType;
                if (folder == "cmds") {
                        typeEnvCommand = "envCommands";
                        setMap = "commands";
                        commandType = "command";
                }
                else if (folder == "events") {
                        typeEnvCommand = "envEvents";
                        setMap = "eventCommands";
                        commandType = "event command";
                }
                let pathCommand;
                if (process.env.NODE_ENV == "development") {
                        const devPath = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.dev.js`);
                        if (fs.existsSync(devPath))
                                pathCommand = devPath;
                        else
                                pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);
                }
                else
                        pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);

                const contentFile = fs.readFileSync(pathCommand, "utf8");
                let allPackage = contentFile.match(regExpCheckPackage);
                if (allPackage) {
                        allPackage = allPackage
                                .map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
                                .filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0 && p.indexOf(__dirname) !== 0);
                        for (let packageName of allPackage) {
                                if (packageName.startsWith('@'))
                                        packageName = packageName.split('/').slice(0, 2).join('/');
                                else
                                        packageName = packageName.split('/')[0];

                                if (!packageAlready.includes(packageName)) {
                                        packageAlready.push(packageName);
                                        if (!fs.existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
                                                let wating;
                                                try {
                                                        wating = setInterval(() => {
                                                                count++;
                                                                loading.info("PACKAGE", `Installing ${packageName} ${spinner[count % spinner.length]}`);
                                                        }, 80);
                                                        execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
                                                        clearInterval(wating);
                                                        if (typeof process.stderr.clearLine === "function") process.stderr.clearLine(0);
                                                }
                                                catch (error) {
                                                        clearInterval(wating);
                                                        if (typeof process.stderr.clearLine === "function") process.stderr.clearLine(0);
                                                        throw new Error(`Can't install package ${packageName}`);
                                                }
                                        }
                                }
                        }
                }
                const oldCommand = require(pathCommand);
                const oldCommandName = oldCommand?.config?.name;
                if (!oldCommandName) {
                        if (GoatBot[setMap].get(oldCommandName)?.location != pathCommand)
                                throw new Error(`${commandType} name "${oldCommandName}" is already exist in command "${removeHomeDir(GoatBot[setMap].get(oldCommandName)?.location || "")}"`);
                }
                if (oldCommand.config.aliases) {
                        let oldAliases = oldCommand.config.aliases;
                        if (typeof oldAliases == "string")
                                oldAliases = [oldAliases];
                        for (const alias of oldAliases)
                                GoatBot.aliases.delete(alias);
                }
                delete require.cache[require.resolve(pathCommand)];

                const command = require(pathCommand);
                command.location = pathCommand;
                const configCommand = command.config;
                if (!configCommand || typeof configCommand != "object")
                        throw new Error("config of command must be an object");
                const scriptName = configCommand.name;

                const indexOnChat = allOnChat.findIndex(item => item == oldCommandName);
                if (indexOnChat != -1)
                        allOnChat.splice(indexOnChat, 1);

                const indexOnFirstChat = allOnChat.findIndex(item => item == oldCommandName);
                let oldOnFirstChat;
                if (indexOnFirstChat != -1) {
                        oldOnFirstChat = allOnFirstChat[indexOnFirstChat];
                        allOnFirstChat.splice(indexOnFirstChat, 1);
                }

                const indexOnEvent = allOnEvent.findIndex(item => item == oldCommandName);
                if (indexOnEvent != -1)
                        allOnEvent.splice(indexOnEvent, 1);

                const indexOnAnyEvent = allOnAnyEvent.findIndex(item => item == oldCommandName);
                if (indexOnAnyEvent != -1)
                        allOnAnyEvent.splice(indexOnAnyEvent, 1);

                if (command.onLoad)
                        command.onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });

                const { envGlobal, envConfig } = configCommand;
                if (!command.onStart)
                        throw new Error('Function onStart is missing!');
                if (typeof command.onStart != "function")
                        throw new Error('Function onStart must be a function!');
                if (!scriptName)
                        throw new Error('Name of command is missing!');
                if (configCommand.aliases) {
                        let { aliases } = configCommand;
                        if (typeof aliases == "string")
                                aliases = [aliases];
                        for (const alias of aliases) {
                                if (aliases.filter(item => item == alias).length > 1)
                                        throw new Error(`alias "${alias}" duplicate in ${commandType} "${scriptName}" with file name "${removeHomeDir(pathCommand || "")}"`);
                                if (GoatBot.aliases.has(alias))
                                        throw new Error(`alias "${alias}" is already exist in ${commandType} "${GoatBot.aliases.get(alias)}" with file name "${removeHomeDir(GoatBot[setMap].get(GoatBot.aliases.get(alias))?.location || "")}"`);
                                GoatBot.aliases.set(alias, scriptName);
                        }
                }
                if (envGlobal) {
                        if (typeof envGlobal != "object" || Array.isArray(envGlobal))
                                throw new Error("envGlobal must be an object");
                        for (const key in envGlobal)
                                configCommands.envGlobal[key] = envGlobal[key];
                }
                if (envConfig && typeof envConfig == "object" && !Array.isArray(envConfig)) {
                        if (!configCommands[typeEnvCommand][scriptName])
                                configCommands[typeEnvCommand][scriptName] = {};
                        configCommands[typeEnvCommand][scriptName] = envConfig;
                }
                GoatBot[setMap].delete(oldCommandName);
                GoatBot[setMap].set(scriptName, command);
                fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
                const keyUnloadCommand = folder == "cmds" ? "commandUnload" : "commandEventUnload";
                const findIndex = (configCommands[keyUnloadCommand] || []).indexOf(`${fileName}.js`);
                if (findIndex != -1)
                        configCommands[keyUnloadCommand].splice(findIndex, 1);
                fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

                if (command.onChat)
                        allOnChat.push(scriptName);

                if (command.onFirstChat)
                        allOnFirstChat.push({ commandName: scriptName, threadIDsChattedFirstTime: oldOnFirstChat?.threadIDsChattedFirstTime || [] });

                if (command.onEvent)
                        allOnEvent.push(scriptName);

                if (command.onAnyEvent)
                        allOnAnyEvent.push(scriptName);

                const indexStorageCommandFilesPath = storageCommandFilesPath.findIndex(item => item.filePath == pathCommand);
                if (indexStorageCommandFilesPath != -1)
                        storageCommandFilesPath.splice(indexStorageCommandFilesPath, 1);
                storageCommandFilesPath.push({
                        filePath: pathCommand,
                        commandName: [scriptName, ...configCommand.aliases || []]
                });

                return {
                        status: "success",
                        name: fileName,
                        command
                };
        }
        catch (err) {
                const defaultError = new Error();
                defaultError.name = err.name;
                defaultError.message = err.message;
                defaultError.stack = err.stack;

                err.stack ? err.stack = removeHomeDir(err.stack || "") : "";
                fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
                return {
                        status: "failed",
                        name: fileName,
                        error: err,
                        errorWithThoutRemoveHomeDir: defaultError
                };
        }
}

function unloadScripts(folder, fileName, configCommands, getLang) {
        const pathCommand = `${process.cwd()}/scripts/${folder}/${fileName}.js`;
        if (!fs.existsSync(pathCommand)) {
                const err = new Error(getLang("missingFile", `${fileName}.js`));
                err.name = "FileNotFound";
                throw err;
        }
        const command = require(pathCommand);
        const commandName = command.config?.name;
        if (!commandName)
                throw new Error(getLang("invalidFileName", `${fileName}.js`));
        const { GoatBot } = global;
        const { onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;
        const indexOnChat = allOnChat.findIndex(item => item == commandName);
        if (indexOnChat != -1)
                allOnChat.splice(indexOnChat, 1);
        const indexOnEvent = allOnEvent.findIndex(item => item == commandName);
        if (indexOnEvent != -1)
                allOnEvent.splice(indexOnEvent, 1);
        const indexOnAnyEvent = allOnAnyEvent.findIndex(item => item == commandName);
        if (indexOnAnyEvent != -1)
                allOnAnyEvent.splice(indexOnAnyEvent, 1);
        if (command.config.aliases) {
                let aliases = command.config?.aliases || [];
                if (typeof aliases == "string")
                        aliases = [aliases];
                for (const alias of aliases)
                        GoatBot.aliases.delete(alias);
        }
        const setMap = folder == "cmds" ? "commands" : "eventCommands";
        delete require.cache[require.resolve(pathCommand)];
        GoatBot[setMap].delete(commandName);
        log.master("UNLOADED", getLang("unloaded", commandName));
        const commandUnload = configCommands[folder == "cmds" ? "commandUnload" : "commandEventUnload"] || [];
        if (!commandUnload.includes(`${fileName}.js`))
                commandUnload.push(`${fileName}.js`);
        configCommands[folder == "cmds" ? "commandUnload" : "commandEventUnload"] = commandUnload;
        fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
        return {
                status: "success",
                name: fileName
        };
}

global.utils.loadScripts = loadScripts;
global.utils.unloadScripts = unloadScripts;
