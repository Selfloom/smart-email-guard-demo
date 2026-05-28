# Smart Email Guard — Installation Guide

> Chrome Extension that catches missing attachments, forgotten links, and CC mistakes before you send emails.

## Visual Install Guide

Prefer pictures? The interactive demo page has a **[visual step-by-step install guide](https://selfloom.github.io/smart-email-guard-demo/#install)** showing all 5 steps — download, unzip, extensions page, developer mode, and load unpacked — with visual cards and a persistent download button.

## Quick Install (Sideload — No Store Needed)

### Chrome / Brave / Edge

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Download** | Get `smart-email-guard-v1.0.1.zip` from [GitHub Releases](https://github.com/Selfloom/smart-email-guard-demo/releases) |
| 2 | **Unzip** | Extract to a folder on your computer (Desktop, Documents, anywhere) |
| 3 | **Open** | Go to `chrome://extensions` in Chrome |
| 4 | **Toggle** | Turn on **Developer mode** (top-right corner switch) |
| 5 | **Load** | Click **Load unpacked** → select the unzipped folder |
| 6 | **Done** | Smart Email Guard is now active! Look for the shield icon 🔰 |

> **Tip**: Pin the extension for easy access. Click the puzzle-piece icon 🧩 in Chrome's toolbar, find Smart Email Guard, and click the pin 📌.

### Firefox

Not yet available. Porting in progress — [watch this repo](https://github.com/Selfloom/smart-email-guard-demo) for updates.

### Supported Email Platforms

- Gmail (mail.google.com)
- Outlook Web (outlook.live.com, outlook.office.com, outlook.office365.com)
- Yahoo Mail (mail.yahoo.com)

## Try Before Installing

Visit the [interactive demo](https://selfloom.github.io/smart-email-guard-demo/) — type a test email, click Send, and see the extension detect mistakes in real time. The demo includes a **[visual 5-step install walkthrough](https://selfloom.github.io/smart-email-guard-demo/#install)** with detailed cards for each step.

## What It Detects

| Check | Trigger | Example |
|-------|---------|---------|
| Missing Attachment | Body says "attached" / "attachment" but no file | "Please find the report attached" |
| Forgotten Link | Body says "click here" / "link below" but no URL | "Check the link below for details" |
| CC/BCC Mistake | Reply-all on a thread that used BCC | Replying to 50 people who shouldn't see each other |

## Privacy

100% local. No data leaves your computer. No servers, no analytics, no tracking.

[Privacy Policy](https://selfloom.github.io/smart-email-guard-demo/privacy/)

## Store Availability

- **Chrome Web Store**: pending Google Developer registration
- **Microsoft Edge Add-ons**: listing ready, pending MS Partner Center account
- **Firefox Add-ons**: porting in progress

## From Source

```bash
git clone https://github.com/Selfloom/smart-email-guard-demo.git
cd smart-email-guard-demo/extension
# Load unpacked in chrome://extensions/
```

## Pricing

- **Free**: All three detection rules, unlimited emails
- **Pro** ($29 one-time via [Buy Me a Coffee](https://buymeacoffee.com/selfloom)): Custom keyword rules, tone guard, undo-send delay. Include "Smart Email Guard Pro" in the message.

---

Built by [Selfloom](https://selfloom.ai). Contact: hello@selfloom.ai
