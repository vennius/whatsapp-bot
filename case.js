const { downloadMediaMessage } = require("@whiskeysockets/baileys")
const { generative, generateImage } = require("./lib/ai")
const hx = require('hxz-api');
const { writeExifImg } = require("./lib/exif");
const Replicate = require("replicate");
const { default: axios } = require("axios");

module.exports = async (x, msg, store) => {
  const type = Object.keys(msg.message)[0]
  const body = type === "conversation" ? msg.message.conversation : type === "extendedTextMessage" ? msg.message.extendedTextMessage.text : type === "imageMessage" ? msg.message.imageMessage.caption : type === "videoMessage" ? msg.message.videoMessage.caption : ''
  const prefix = /^[.]/.test(body) ? body.match(/^[.]/gi) : '#'
  const isCmd = body.startsWith(prefix)
  const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
  const args = body.split(" "); args.shift();
  const from = msg.key.remoteJid
  const { imageMessage } = msg.message;

  if (isCmd) {
    console.log(require("chalk").black(require("chalk").bgGreen(`Command ${prefix + command} `)), require("chalk").black(require("chalk").bgWhite(`Dari ${msg.pushName}`)))
  }

  const reply = (teks) => {
    x.sendMessage(from, { text: teks }, { quoted: msg })
  }


  switch (command) {
    case "gmbr":
      const media = await downloadMediaMessage(msg, "buffer");
      x.sendMessage(from, {
        image: media,
        caption: "gmbrrr"
      })
      break;
    case "gen":
      if (args.length < 1) break;
      const tempMsg = await x.sendMessage(from, { text: "Sabar..." }, { quoted: msg })
      try {

        const answer = await generative(args.join(" "))
        await x.sendMessage(from, {
          text: answer,
          edit: tempMsg.key
        })
      } catch (err) {
        await x.sendMessage(from, {
          text: "Input yang dimasukkan illegal",
          edit: tempMsg.key
        })
      }
      break;
    case "lirik":
      const tempMsg1 = await x.sendMessage(from, { text: "Sabar..." }, { quoted: msg })
      const res = await hx.lirik(args.join(" "))
      await x.sendMessage(from, {
        text: res.lirik,
        edit: tempMsg1.key
      })
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
    case "sunhua":
      const image = await generateImage(args.join(" ") + " cinematic, aesthetic, dramatic.");
      await x.sendMessage(from, {
        image,
        caption: `${args.join(" ")}`
      })
      break;
  }
}
