# Smart Email Guard — Installation Guide

> Chrome Extension that catches missing attachments, forgotten links, and CC mistakes before you send emails.

## Quick Install (Sideload — No Store Needed)

### Chrome / Brave / Edge

1. **Download** `smart-email-guard-v1.0.1.zip` from [GitHub Releases](https://github.com/Selfloom/smart-email-guard-demo/releases)
2. **Unzip** the file to a folder on your computer
3. Open Chrome and go to `chrome://extensions/`
4. Turn on **Developer mode** (toggle in top-right corner)
5. Click **Load unpacked** and select the unzipped folder
6. Smart Email Guard is now active!

### Firefox

Not yet available. Porting in progress — [watch this repo](https://github.com/Selfloom/smart-email-guard-demo) for updates.

### Supported Email Platforms

- Gmail (mail.google.com)
- Outlook Web (outlook.live.com, outlook.office.com, outlook.office365.com)
- Yahoo Mail (mail.yahoo.com)

## Try Before Installing

Visit the [interactive demo](https://selfloom.github.io/smart-email-guard-demo/) — type a test email, click Send, and see the extension detect mistakes in real time.

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
- **Pro** ($29 one-time, coming soon): Custom keyword rules, tone guard, undo-send delay

---

Built by [Selfloom](https://selfloom.ai). Contact: hello@selfloom.ai
