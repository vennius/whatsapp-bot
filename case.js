const { downloadMediaMessage } = require("@whiskeysockets/baileys")
const { generative, generateImage } = require("./lib/ai")
const hx = require('hxz-api');
const { writeExifImg } = require("./lib/exif");
const { Reactor } = require("./lib/helper");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");

module.exports = async (x, msg, store) => {
  const type = Object.keys(msg.message)[0]
  const body = type === "conversation" ? msg.message.conversation : type === "extendedTextMessage" ? msg.message.extendedTextMessage.text : type === "imageMessage" ? msg.message.imageMessage.caption : type === "videoMessage" ? msg.message.videoMessage.caption : ''
  const prefix = /^[.]/.test(body) ? body.match(/^[.]/gi) : '#'
  const isCmd = body.startsWith(prefix)
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  const args = body.split(" "); args.shift();
  const from = msg.key.remoteJid
  const { imageMessage } = msg.message;
  const reactor = new Reactor(from, x.sendMessage, msg.key);

  if (isCmd) {
    console.log(require("chalk").black(require("chalk").bgGreen(`Command ${prefix + command} `)), require("chalk").black(require("chalk").bgWhite(`Dari ${msg.pushName}`)))
  }


  switch (command) {
    case "play":
      await reactor.loading()
      let rus = await yts(args.join(" "))
      if (rus.all.length == "0") return await x.sendMessage(from, { text: "gak boleh kosong" }, { quoted: msg })
      let data = await rus.all.filter(v => v.type == 'video')
      const video = data[0]
      let mp3File = `audio/${Math.floor(Math.random() * 10000000)}.mp3`
      await ytdl(video.url, { filter: 'audioonly' })
        .pipe(fs.createWriteStream(mp3File))
        .on("finish", async () => {
          await x.sendMessage(from, { audio: fs.readFileSync(mp3File), mimetype: 'audio/mp4' }, { quoted: msg })
        })
      await reactor.succes()
      break;
    case "gen":
      if (args.length < 1) break;
      // const tempMsg = await x.sendMessage(from, { text: "Sabar..." }, { quoted: msg })
      await reactor.loading()
      try {

        const answer = await generative(args.join(" "))
        await x.sendMessage(from, {
          text: answer,
          // edit: tempMsg.key
        })
        await reactor.succes()
      } catch (err) {
        await reactor.error()
      }
      break;
    case "lirik":
      await reactor.loading()
      const res = await hx.lirik(args.join(" "))
      await x.sendMessage(from, {
        text: res.lirik,
      })
      await reactor.succes()
      break;
    case "sticker":
      if (!imageMessage) return

      let buffer = await downloadMediaMessage(msg, "buffer", {}, {
      });

      buffer = await writeExifImg(buffer, {
        packname: "walaw e", author: "phei"
      });

      await x.sendMessage(from, {
        sticker: {
          url: buffer
        }
      })
      break;
    case "genjpg":
      await reactor.loading()
      const image = await generateImage(args.join(" ") + " cinematic, aesthetic, dramatic.");
      await x.sendMessage(from, {
        image,
        caption: `${args.join(" ")}`
      })
      await reactor.succes()
      break;
  }
}
