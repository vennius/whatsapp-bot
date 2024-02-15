const useCODE = process.argv.includes("--code")
const useQR = !useCODE
const { default: makeWASocket, makeWALegacySocket, BufferJSON, Browsers, initInMemoryStore, extractMessageContent, makeInMemoryStore, proto, delay, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, jidDecode, areJidsSameUser, PHONENUMBER_MCC, WA_DEFAULT_EPHEMERAL, relayMessage, getContentType, generateWAMessage, generateWAMessageContent, generateForwardMessageContent, generateWAMessageFromContent } = require("@whiskeysockets/baileys")
const readline = require("readline")
const pino = require("pino")
const chalk = require("chalk")
const { parsePhoneNumber } = require("libphonenumber-js")
const NodeCache = require("node-cache")
const { checkIsBlocked } = require("./lib/helper")

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })


async function startSesi() {
  process.on("unhandledRejection", error => console.error(error))
  const { state, saveCreds } = await useMultiFileAuthState("./session")
  const { version, isLatest } = await fetchLatestBaileysVersion()
  const nodeCache = new NodeCache()
  const connectionUpdate = {
    version,
    keepAliveInternalMs: 30000,
    printQRInTerminal: useQR && !useCODE,
    generateHighQualityLinkPreview: true,
    msgRetryCounterCache: nodeCache,
    markOnlineOnConnect: true,
    defaultQueryTimeoutMs: undefined,
    logger: pino({ level: "fatal" }),
    auth: state,
    browser: ["Safari (Linux)", "safari", "1.0.0"]
  }
  const x = makeWASocket(connectionUpdate)

  store.bind(x.ev)

  setInterval(() => {
    store.writeToFile("./store.json")
  }, 10000)

  // pairing code system
  if (useCODE && !x.user && !x.authState.creds.registered) {
    async function StartYtta() {
      const rl = readline.createInterface({
        'input': process.stdin,
        'output': process.stdout
      });
      const question = text => new Promise(_0x567fc3 => rl.question(text, _0x567fc3));
      const phoneNumber = await question("\nPlease type your WhatsApp number : ");
      unprocessedNumber = phoneNumber.replace(/[^0-9]/g, '');
      processedNumber = parsePhoneNumber('+' + unprocessedNumber);
      if (!processedNumber.isValid()) {
        console.log(chalk.bgBlack(chalk.redBright("Start With your country's WhatsApp code, Example : 628xxx")));
        rl.close();
        return StartYtta();
      }
      const _0x490e72 = PHONENUMBER_MCC[processedNumber.countryCallingCode];
      if (!_0x490e72) {
        console.log(chalk.bgBlack(chalk.redBright("Start With your country's WhatsApp code, Example : 628xxx")));
        rl.close();
        return StartYtta();
      }
      const tempCode = await x.requestPairingCode(unprocessedNumber);
      code = tempCode?.['match'](/.{1,4}/g)?.["join"]('-') || tempCode;
      console.log(chalk.bgBlack(chalk.bgGreen("Your pairing code : ")), chalk.black(chalk.bgWhite(code)));
      rl.close();
    }
    await StartYtta();
  }

  x.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("KONEKSI " + "Terhubung (" + x.user?.["id"]["split"](":")[0] + ")")
    }
    if (connection === "close") {
      startSesi()
    }
    if (connection === "connecting") {
      if (x.user) {
        console.log("KONEKSI " + "Menghubungkan Ulang (" + x.user?.["id"]["split"](":")[0] + ")")
      } else if (!useQR && !useCODE) {
        console.log("CONNECTION " + "Autentikasi Dibutuhkan\nGunakan Perintah \x1B[36mnpm start\x1B[0m untuk terhubung menggunakan nomor telepon\n\n\x1B[1m\x1B[41m Full Tutorial Check di Youtube: @KirBotz \x1B[0m\n\n")
      }
    }
  })

  x.ev.process(async (events) => {
    if (events['messages.upsert']) {
      const upsert = events['messages.upsert']
      for (let msg of upsert.messages) {
        //console.log(msg)
        if (!msg.message) {
          return
        }
        if (msg.key.remoteJid === 'status@broadcast') {
          if (msg.message?.protocolMessage) return
          return console.log(`Update status dari ${msg.pushName} ${msg.key.participant.split('@')[0]}`)
        }

        const type = Object.keys(msg.message)[0]
        const body = type === "conversation" ? msg.message.conversation : type === "extendedTextMessage" ? msg.message.extendedTextMessage.text : type === "imageMessage" ? msg.message.imageMessage.caption : type === "videoMessage" ? msg.message.videoMessage.caption : ''
        console.log(require("chalk").black(require("chalk").bgGreen(`Pesan "${body}" `)), require("chalk").black(require("chalk").bgWhite(`Dari ${msg.pushName} ID: ${msg.key.remoteJid}`)))

        if (checkIsBlocked(msg.key?.remoteJid)) return;

        require("./case")(x, msg, store)
      }
    }
  })

  x.ev.on('creds.update', saveCreds)
  x.number = x.user?.["id"]["split"](":")[0] + "@s.whatsapp.net"
  x.owner = {
    "name": `Bot WhatsApp`,
    "number": `62895412604276@s.whatsapp.net`
  }
  return x
}

startSesi()
