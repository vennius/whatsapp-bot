const { blockedJid } = require("../config");

function checkIsBlocked(senderJid) {
  for (const jid of blockedJid) {
    if (jid == senderJid) return true;
  }
  return false;
}

async function loading(from, sendMessage, key){
  await sendMessage(from, {
    react: {
      text: "⏳",
      key
    }})
}

async function succes(from, sendMessage, key){
  await sendMessage(from, {
    react: {
      text: "✅",
      key
    }})
}

async function error(from, sendMessage, key){
  await sendMessage(from, {
    react: {
      text: "❌",
      key
    }})
}

const react = {
  loading,
  succes,
  error
}

class Reactor{
  constructor(from, sendMessage, key){
    this.from = from;
    this.sendMessage = sendMessage;
    this.key = key;
  }
  
  async loading(){
    await this.sendMessage(this.from, {
      react: {
       text: "⏳",
       key: this.key
      }
    });
  }

  async succes(){
    await this.sendMessage(this.from, {
      react: {
       text: "✅",
       key: this.key
      }
    });
  }
  
  async error(){
    await this.sendMessage(this.from, {
      react: {
       text: "❌",
       key: this.key
      }
    });
  }

}

module.exports = {
  checkIsBlocked,
  Reactor
}
