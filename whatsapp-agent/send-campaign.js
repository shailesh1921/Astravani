/**
 * AstraVani Standalone Terminal WhatsApp Agent
 * Connects directly to your WhatsApp Business number via QR code and sends campaign messages.
 */

import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES } from './templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const AUTH_DIR = path.join(__dirname, '.auth_info');
const LOGS_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

const REPORT_FILE = path.join(LOGS_DIR, 'sent_report.csv');
if (!fs.existsSync(REPORT_FILE)) {
  fs.writeFileSync(REPORT_FILE, 'timestamp,phone,name,status,error\n');
}

// Helpers
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const cleanPhoneNumber = (raw) => {
  let cleaned = String(raw).replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }
  return cleaned;
};

// Parse contacts from CSV or numbers.txt
function loadContacts() {
  const contacts = [];
  const csvPath = path.join(__dirname, 'contacts.csv');
  const txtPath = path.join(__dirname, 'numbers.txt');

  if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.toLowerCase().startsWith('phone')) return;
      const parts = trimmed.split(/[,;\t]/).map(p => p.trim());
      const phone = cleanPhoneNumber(parts[0]);
      const name = parts[1] || 'Mitra';
      const topic = parts[2] || 'General';

      if (phone.length >= 10) {
        contacts.push({ phone, name, topic });
      }
    });
  }

  // Also check numbers.txt if CSV had no contacts
  if (contacts.length === 0 && fs.existsSync(txtPath)) {
    const content = fs.readFileSync(txtPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const phone = cleanPhoneNumber(trimmed);
      if (phone.length >= 10) {
        contacts.push({ phone, name: 'Mitra', topic: 'General' });
      }
    });
  }

  return contacts;
}

// Read already sent numbers to prevent duplicate sends
function getSentNumbers() {
  const sent = new Set();
  if (fs.existsSync(REPORT_FILE)) {
    const lines = fs.readFileSync(REPORT_FILE, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      if (idx === 0 || !line.trim()) return;
      const parts = line.split(',');
      if (parts[1] && parts[3] === 'SUCCESS') {
        sent.add(parts[1].trim());
      }
    });
  }
  return sent;
}

async function startWhatsAppAgent() {
  console.clear();
  console.log('====================================================');
  console.log('🕉️   AstraVani Standalone Terminal WhatsApp Agent   🕉️');
  console.log('====================================================\n');

  // Choose template
  const args = process.argv.slice(2);
  let templateKey = 'free_consultation';
  const tmplArg = args.find(a => a.startsWith('--template='));
  if (tmplArg) {
    templateKey = tmplArg.split('=')[1];
  }

  const selectedTemplate = TEMPLATES[templateKey] || TEMPLATES.free_consultation;
  console.log(`📌 Active Template: ${selectedTemplate.title}`);

  // Load contacts
  const allContacts = loadContacts();
  const sentNumbers = getSentNumbers();
  const pendingContacts = allContacts.filter(c => !sentNumbers.has(c.phone));

  console.log(`📋 Total Contacts: ${allContacts.length}`);
  console.log(`✅ Already Sent:    ${sentNumbers.size}`);
  console.log(`⏳ Pending Queue:   ${pendingContacts.length}\n`);

  if (pendingContacts.length === 0) {
    console.log('🎉 No pending contacts found! Please add numbers to contacts.csv or numbers.txt\n');
    process.exit(0);
  }

  console.log('🔄 Initializing WhatsApp connection...');
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 SCAN THIS QR CODE WITH YOUR WHATSAPP BUSINESS APP:');
      console.log('(Open WhatsApp > Linked Devices > Link a Device)\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        startWhatsAppAgent();
      } else {
        console.log('❌ Logged out. Delete .auth_info/ and restart to scan again.');
      }
    } else if (connection === 'open') {
      const userJid = sock.user.id;
      const myNumber = userJid.split(':')[0];
      console.log(`\n✅ Connected successfully to WhatsApp Business!`);
      console.log(`📱 Sender Number: +${myNumber}\n`);
      console.log('🚀 Starting automated dispatch to pending contacts...\n');

      // Dispatch loop
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < pendingContacts.length; i++) {
        const contact = pendingContacts[i];
        const jid = `${contact.phone}@s.whatsapp.net`;
        const currentNum = i + 1;
        const total = pendingContacts.length;

        try {
          // 1. Verify number exists on WhatsApp
          const [exists] = await sock.onWhatsApp(jid);
          if (!exists || !exists.exists) {
            console.log(`[${currentNum}/${total}] ⚠️ +${contact.phone} (${contact.name}) is NOT on WhatsApp. Skipping.`);
            fs.appendFileSync(REPORT_FILE, `${new Date().toISOString()},${contact.phone},"${contact.name}",NOT_ON_WHATSAPP,-\n`);
            failCount++;
            continue;
          }

          // 2. Format personalized message
          const messageText = selectedTemplate.format(contact.name);

          // 3. Send message
          await sock.sendMessage(exists.jid || jid, { text: messageText });
          console.log(`[${currentNum}/${total}] ✅ Sent to +${contact.phone} (${contact.name})`);
          fs.appendFileSync(REPORT_FILE, `${new Date().toISOString()},${contact.phone},"${contact.name}",SUCCESS,-\n`);
          successCount++;

          // 4. Safe delay between messages (7 to 12 seconds) to protect number
          if (i < pendingContacts.length - 1) {
            const delaySec = Math.floor(Math.random() * 5) + 7;
            process.stdout.write(`   ⏳ Waiting ${delaySec}s before next contact... \r`);
            await sleep(delaySec * 1000);
          }

        } catch (err) {
          console.error(`[${currentNum}/${total}] ❌ Failed to send to +${contact.phone}: ${err.message}`);
          fs.appendFileSync(REPORT_FILE, `${new Date().toISOString()},${contact.phone},"${contact.name}",FAILED,"${err.message}"\n`);
          failCount++;
        }
      }

      console.log('\n====================================================');
      console.log('🏁 Campaign Run Finished!');
      console.log(`✅ Successfully Sent: ${successCount}`);
      console.log(`❌ Failed / Skipped:   ${failCount}`);
      console.log(`📁 Detailed Report:     whatsapp-agent/logs/sent_report.csv`);
      console.log('====================================================\n');
      process.exit(0);
    }
  });
}

// Start agent
startWhatsAppAgent().catch(err => {
  console.error('Fatal agent error:', err);
});
