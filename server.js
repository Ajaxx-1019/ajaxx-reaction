import express from "express"
import cors from "cors"
import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"

const app = express()
app.use(cors())
app.use(express.json())

let sock

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })
  sock.ev.on("creds.update", saveCreds)
}
startBot()

app.post("/react", async (req, res) => {
  const { jid, emoji } = req.body
  try {
    await sock.sendMessage(jid, {
      react: {
        text: emoji,
        key: { remoteJid: jid, fromMe: false, id: "dummy" }
      }
    })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get("/", (req, res) => {
  res.send("Ajaxx backend running")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})