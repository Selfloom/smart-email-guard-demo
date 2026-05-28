# SUBMIT NOW — Smart Email Guard → Microsoft Edge Add-ons

**Time: 5 minutes. Cost: $0. Reach: 300M users. No accounts needed beforehand.**

Open this file. Follow each step. Every URL, every text to paste, every file to upload is here. No cross-referencing.

---

## PRE-FLIGHT (30 seconds — verify before starting)

| Check | Expected | Actual |
|-------|----------|--------|
| Extension `.zip` downloadable? | [GitHub Release v1.0.1](https://github.com/Selfloom/smart-email-guard-demo/releases/tag/v1.0.1) → download `smart-email-guard-v1.0.1.zip` | ⬜ |
| Privacy policy live? | Visit [selfloom.github.io/.../privacy/](https://selfloom.github.io/smart-email-guard-demo/privacy/) → page loads, no 404 | ⬜ |
| Demo page live? | Visit [selfloom.github.io/.../](https://selfloom.github.io/smart-email-guard-demo/) → page loads with demo | ⬜ |
| GitHub Issues available? | Visit [github.com/Selfloom/smart-email-guard-demo/issues](https://github.com/Selfloom/smart-email-guard-demo/issues) → page loads | ⬜ |

> If any check fails: stop, fix the URL, then continue. Do not submit with broken links.

---

## STEP 1: Create Microsoft Account (60 seconds)

**You only need this if you don't have a Microsoft account. Edge Partner Center also accepts GitHub login — try that first.**

**Option A — Use GitHub login (preferred, 10 seconds):**
1. Go to https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. Click "Sign in with GitHub"
3. Authorize the Microsoft Partner Center app
4. Skip to Step 2

**Option B — Use existing Microsoft account (10 seconds):**
1. Go to https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. Sign in with your Outlook.com / Hotmail.com / Live.com account
3. Skip to Step 2

**Option C — Create new account with hello@selfloom.ai (60 seconds):**
1. Go to https://signup.live.com
2. Click "Use your email address instead"
3. Enter: `hello@selfloom.ai`
4. Create a password (save it in a password manager)
5. Fill in name: `Selfloom`
6. Complete CAPTCHA
7. Verify email (check inbox at hello@selfloom.ai)
8. Go to https://partner.microsoft.com/dashboard/microsoftedge/public/login
9. Sign in with hello@selfloom.ai
10. Proceed to Step 2

---

## STEP 2: Register as Individual Developer (120 seconds)

After signing in, Partner Center will walk you through registration. Exact fields:

### Account Type
- Select: **Individual** (not Company)
- If asked for business verification: select "I am an individual developer"

### Publisher Display Name
> This is the name shown on the Edge Add-ons store page. It does NOT need to match manifest.json.

```
Selfloom
```

### Developer Info
| Field | Value |
|-------|-------|
| First name | Selfloom |
| Last name | (use account holder's last name) |
| Email | hello@selfloom.ai |
| Country/Region | (use account holder's country) |

### Tax Info
> Microsoft requires tax information even for free extensions. Select "Individual" as tax entity type. For US-based: enter SSN or EIN. For non-US: foreign TIN or "I am not a US taxpayer" checkbox.

### Verification
- Microsoft may send a verification code to your email or phone
- Enter the code when prompted
- This is the ONLY potential delay — codes usually arrive in 30-60 seconds

### Agreement
- Accept the Microsoft Edge Add-ons Developer Agreement
- Accept the Microsoft Partner Agreement

> **Done?** You're now a registered Edge Add-ons developer. The Partner Center dashboard loads. Proceed to Step 3.

---

## STEP 3: Submit Extension (90 seconds)

From the Partner Center dashboard, click **"Create new extension"** (or "Add extension").

### 3.1 Extension Package

**Upload the extension `.zip` file.**

1. Download the `.zip` from the GitHub Release if you haven't already:
   - URL: `https://github.com/Selfloom/smart-email-guard-demo/releases/tag/v1.0.1`
   - File: `smart-email-guard-v1.0.1.zip`
2. Click **Upload** and select the `.zip` file
3. Wait for automated manifest validation (~5 seconds)
4. If validation fails: check that `manifest.json` inside the zip has `"manifest_version": 3` and all referenced files exist

### 3.2 Availability

- **Visibility:** Public
- **Distribution:** All markets (or select specific countries if needed)

### 3.3 Properties

#### Extension Name
> Must match `manifest.json` `"name"` field exactly. Our manifest says "Smart Email Guard".

```
Smart Email Guard
```

#### Short Description (shown in search results, max ~150 chars)
> Copy exactly:

```
Warns you before sending emails with missing attachments, links, or CC recipients. Works in Gmail, Outlook Web, and Yahoo Mail. 100% local.
```

#### Detailed Description (HTML format)
> Edge supports HTML tags. Copy the ENTIRE block below:

```html
<p><b>"Please find the report attached."</b></p>

<p>You hit Send. Your stomach drops. The file isn't there. Now you have to send the awkward follow-up: "Apologies, here's the actual attachment." You've just signaled to your client, your boss, or your recruiter that you're disorganized — and it only took half a second.</p>

<p>Smart Email Guard stops this before it happens.</p>

<h3>What it does</h3>

<p>Before you send an email, Smart Email Guard scans your message for trigger phrases — "attached," "here's the link," "I've CC'd Sarah" — and checks whether the promised element is actually present. If something looks missing, it shows a clean warning and blocks the send. You choose: "Go Back" to fix it, or "Send Anyway" if you meant it.</p>

<h3>Three checks, always free</h3>

<ul>
  <li><b>File Attachments</b> — wrote "attached" or "see attachment" but no file is present</li>
  <li><b>URLs &amp; Links</b> — wrote "here's the link" or "check this out" but no URL in the body</li>
  <li><b>CC Recipients</b> — wrote "I've CC'd" or "CC'ing [name]" but the CC field is empty</li>
</ul>

<h3>Works across platforms</h3>

<ul>
  <li>Gmail (mail.google.com)</li>
  <li>Outlook Web — personal (outlook.live.com) and business (outlook.office.com / outlook.office365.com)</li>
  <li>Yahoo Mail (mail.yahoo.com)</li>
</ul>

<h3>Privacy</h3>

<ul>
  <li>All processing runs locally in your browser</li>
  <li>No data is ever sent to any server</li>
  <li>No account required</li>
  <li>No analytics, no tracking</li>
  <li>Email content never leaves your machine</li>
  <li>Only two permissions: <code>storage</code> and <code>host_permissions</code> scoped to the supported email platforms</li>
</ul>

<h3>Pro upgrade (optional)</h3>

<ul>
  <li>Unlimited custom trigger patterns (e.g., "calendar invite," "meeting details," company-specific phrases)</li>
  <li>Regex-based pattern matching for advanced users</li>
  <li>Multi-language trigger phrase support</li>
  <li>Cloud sync for your patterns across devices</li>
</ul>

<p>Pro is $3.99/month or $29 one-time lifetime access.</p>
```

#### Categories
- **Primary:** Productivity
- **Secondary:** Communication

> If "Communication" is not available in the dropdown, use "Workflow & Planning".

#### Search Keywords
> Paste this line into the keywords/tags field (comma-separated or one per line — follow whatever the UI expects):

```
email attachment reminder, forgot attachment, attachment checker, email send guard, missing attachment warning, forgot to attach file, email safety check, send email confirmation, Gmail attachment checker, Outlook attachment checker, forgot link email, email send protection, pre-send email check, email mistake prevention, forgot to CC, Outlook add-in, Edge extension email, email productivity tool, send email double check, email assistant
```

#### Language
- **English (United States)**

### 3.4 URLs

| Field | URL to paste |
|-------|-------------|
| **Website** | `https://selfloom.github.io/smart-email-guard-demo/` |
| **Privacy Policy** | `https://selfloom.github.io/smart-email-guard-demo/privacy/` |
| **Support** | `https://github.com/Selfloom/smart-email-guard-demo/issues` |

### 3.5 Screenshots

You need 3-5 screenshots, **PNG format, 1280×800 pixels**. The minimum is 1, but submit at least 3 for better trust.

**How to capture (5 minutes extra):**

1. Open `workspace/smart-email-guard/screenshots/index.html` in Chrome
2. Open DevTools (F12), toggle Device Toolbar (Ctrl+Shift+M), set dimensions to **1280 × 800**
3. For each screenshot below, scroll to that section, capture with a screenshot tool (or use the built-in "Capture screenshot" in DevTools: Ctrl+Shift+P → "Capture screenshot")
4. Save as PNG with the filenames shown

| # | Capture | Filename | Caption (for Partner Center UI) |
|---|---------|----------|--------------------------------|
| 1 | Popup detection UI (shows all 3 check results: attachment red, CC green, link green) | `screenshot-1-popup.png` | "Real-time detection of missing attachments, forgotten links, and CC mistakes before sending" |
| 2 | In-Gmail overlay warning (red banner at bottom of compose window with "Attach File" and "Send Anyway" buttons) | `screenshot-2-overlay.png` | "Non-intrusive warning appears directly in the Gmail compose window" |
| 3 | All three warnings triggered (popup with all 3 red/yellow indicators + summary bar) | `screenshot-3-all-warnings.png` | "Catches multiple missing elements simultaneously — attachments, links, and CC recipients" |
| 4 | Extension popup with toggle switches (showing the three default checks with type badges) | `screenshot-4-toggles.png` | "Toggle individual checks on/off from the extension popup — three defaults, always free" |
| 5 | Outlook Web detection (same detection overlay but in Outlook Web compose, showing cross-platform support) | `screenshot-5-outlook.png` | "Same protection in Outlook Web — personal and business accounts, Edge-native" |

> **No screenshot 5?** Submit with 4. 3 is the minimum that looks professional. Screenshot 2 (overlay) is the strongest hero image.

---

## STEP 4: Submit for Review (30 seconds)

1. Review all fields on the submission page
2. If Partner Center has a **"Pricing" section**: select **"Free"** (the extension is free; Pro is an in-app upgrade, not a store price)
3. Click **Submit** (or "Publish" or "Submit for review")
4. You'll see a confirmation page: "Your extension has been submitted for review"

> **Done in 5 minutes.** Microsoft reviews typically take 1-3 business days. You'll receive an email when approved.

---

## What Happens After Submission

| Timeline | Event |
|----------|-------|
| Immediately | Extension enters "In review" status on Partner Center |
| 1-3 business days | Microsoft approval or rejection (email notification) |
| After approval | Extension live on Edge Add-ons at a URL like `https://microsoftedge.microsoft.com/addons/detail/...` |
| After live | Unblock Reddit, HN, Product Hunt distribution (all need a store URL) |

**If rejected:** Microsoft provides a reason. Most common: manifest validation, privacy policy URL not reachable, or screenshots don't match functionality. Fix and resubmit.

---

## Emergency Fallback (if Partner Center blocks registration)

If account creation fails (e.g., verification loop, country restriction):

1. **GitHub Releases are live** — users can download v1.0.1 and sideload. Not ideal for mass adoption, but it works.
2. **Firefox AMO** — also $0 registration, similar process. Porting effort: ~2 hours (manifest differences are minimal).
3. **Chrome Web Store** — requires $5 one-time Google Developer fee. Request #001 covers this.

---

## All Assets at a Glance

| What | Where |
|------|-------|
| Extension `.zip` | https://github.com/Selfloom/smart-email-guard-demo/releases/tag/v1.0.1 |
| Extension source | https://github.com/Selfloom/smart-email-guard-demo/tree/main/extension |
| Demo page | https://selfloom.github.io/smart-email-guard-demo/ |
| Privacy policy | https://selfloom.github.io/smart-email-guard-demo/privacy/ |
| Screenshot mockups to capture | `workspace/smart-email-guard/screenshots/index.html` (open in browser) |
| Reddit post drafts | `workspace/distribution/reddit-smart-email-guard.md` |
| CWS listing copy | `workspace/distribution/cws-listing-seg.md` |
| HN post draft | `workspace/distribution/hackernews-show-hn.md` |
| PH launch kit | `workspace/distribution/producthunt-launch.md` |
| Market evidence | `ledger/market-evidence-email-oops-detection.md` |
| Fresh buyer signals | `ledger/fresh-evidence-2026-05-28.md` |

---

*This is the canonical Edge Add-ons submission guide for team-03. Last updated: 2026-05-28. If any URL breaks, fix it here and in `edge-addons-listing.md`.*
