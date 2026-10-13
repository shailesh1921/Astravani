# 🕉️ AstraVani Standalone Terminal WhatsApp Agent

This is a **completely standalone terminal bot** that runs on your local computer. It links directly with your **WhatsApp Business number** (using a simple terminal QR code) and automatically sends personalized AstraVani marketing messages to any list of customer numbers.

**Your public website (`astravani.in`) has zero connection to this script.**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies
Open your terminal and run:
```bash
cd whatsapp-agent
npm install
```

### Step 2: Add Your Customer Numbers
Open `contacts.csv` and paste your numbers in this format:
```csv
phone,name,topic
919876543210,Rahul,Career
919811223344,Priya,Marriage
919988776655,Amit,Kundli
```
*(Or simply paste numbers into `numbers.txt` line by line)*

### Step 3: Run the Agent
Run the script in your terminal:
```bash
npm run send
```

1. A **QR Code** will appear in your terminal.
2. Open **WhatsApp Business** on your phone → go to **Linked Devices** → tap **Link a Device** → scan the terminal QR code.
3. The agent will connect immediately and start sending messages one by one!

---

## 🎯 How to Choose Templates

You can choose between different high-converting templates:

```bash
# 1. First 5 Mins FREE Consultation (Default / Highest converting)
node send-campaign.js --template=free_consultation

# 2. Kundli Milan & Marriage Compatibility
node send-campaign.js --template=kundli_milan

# 3. Career, Promotion & Job Timing
node send-campaign.js --template=career

# 4. Free Janam Kundli Report
node send-campaign.js --template=kundli
```

---

## 🛡️ Built-in Anti-Ban Safety Features
1. **Registered WhatsApp Check:** Checks if the recipient is on WhatsApp before attempting to send (`sock.onWhatsApp`).
2. **Human-like Delay:** Adds a randomized 7 to 12-second delay between messages so WhatsApp does not flag your account.
3. **No Duplicate Sends:** Automatically tracks every sent message in `logs/sent_report.csv`. If you stop and restart, it skips already-sent numbers.
4. **Persistent Session:** Saves login state in `.auth_info/` so you only have to scan the QR code once.

---

## 📁 Files in this folder
- `send-campaign.js` — Main agent execution script
- `templates.js` — Customizable message templates
- `contacts.csv` — Contact list with names & topics
- `numbers.txt` — Simple line-by-line phone number list
- `logs/sent_report.csv` — Real-time delivery report
