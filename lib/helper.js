const { blockedJid } = require("../config");

function checkIsBlocked(senderJid) {
  for (const jid of blockedJid) {
    if (jid == senderJid) return true;
  }
  return false;
}

module.exports = {
  checkIsBlocked
}
