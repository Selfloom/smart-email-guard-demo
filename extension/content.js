// Smart Email Guard - Content Script
// Runs on Gmail, Outlook, Yahoo Mail. Intercepts Send clicks and warns
// if a trigger phrase is present but the promised element is missing.

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  const DEBUG = false;
  let patterns = [];
  let warningActive = false;
  let pendingSendButton = null;
  let modalOverlay = null;
  let modalElement = null;

  function log(...args) {
    if (DEBUG) console.log('[Smart Email Guard]', ...args);
  }

  // ── Default Patterns ───────────────────────────────────────
  function getDefaultPatterns() {
    return [
      {
        id: 'default-file',
        type: 'file',
        phrases: [
          'attached', 'attachment', 'see attached',
          'please find attached', 'find attached',
          'attached file', "I've attached", 'attach is',
          'attached please find', 'see the attachment'
        ],
        enabled: true,
        isDefault: true
      },
      {
        id: 'default-link',
        type: 'link',
        phrases: [
          "here's the link", 'see link below',
          'check out this link', 'link to',
          'click the link', 'the link is',
          'following link', 'here is the link',
          "here's a link", 'check the link'
        ],
        enabled: true,
        isDefault: true
      },
      {
        id: 'default-cc',
        type: 'cc',
        phrases: [
          "I've cc'd", "cc'd on this", 'copying',
          'ccing', "cc'ed", 'cc:', 'I cc\'d',
          'cc\'d them', 'have cc\'d', 'ccing them'
        ],
        enabled: true,
        isDefault: true
      }
    ];
  }

  // ── Storage ────────────────────────────────────────────────
  function loadPatterns() {
    return new Promise(function (resolve) {
      chrome.storage.sync.get(['patterns'], function (result) {
        if (result.patterns && result.patterns.length > 0) {
          patterns = result.patterns;
        } else {
          patterns = getDefaultPatterns();
        }
        resolve(patterns);
      });
    });
  }

  // ── Send Button Detection ──────────────────────────────────
  function isSendButton(el) {
    if (!el || el.nodeType !== 1) return false;

    var tag = el.tagName.toLowerCase();
    var text = (el.textContent || '').trim().toLowerCase();
    var ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    var title = (el.title || '').toLowerCase();
    var dataTooltip = (el.getAttribute('data-tooltip') || '').toLowerCase();

    // Must contain "send" but not just be a generic container
    var hasSendText =
      text === 'send' ||
      text.startsWith('send ') ||
      ariaLabel.includes('send') ||
      title.includes('send') ||
      dataTooltip.includes('send');

    if (!hasSendText) return false;

    // Filter out dropdown arrows (Schedule send, etc.)
    // The main Send button is usually wider
    if (el.offsetWidth < 30 && el.offsetHeight < 20) return false;

    // Exclude elements with "schedule" in aria-label (dropdown toggle)
    if (ariaLabel.includes('schedule') && !ariaLabel.includes('send')) return false;

    // Accept buttons and role="button" elements
    if (tag === 'button') return true;
    if (el.getAttribute('role') === 'button') return true;

    // Gmail / Outlook often use divs with role="button"
    if ((tag === 'div' || tag === 'span') && el.getAttribute('role') === 'button') {
      return true;
    }

    return false;
  }

  // ── Compose Container & Body Detection ─────────────────────
  function findComposeContainer(startEl) {
    var current = startEl;
    var depth = 0;
    var maxDepth = 25;

    while (current && current !== document.body && depth < maxDepth) {
      // Check for dialog role (Gmail compose)
      if (current.getAttribute && current.getAttribute('role') === 'dialog') {
        return current;
      }

      // Try to find an email body within this ancestor
      var body = findEmailBody(current);
      if (body) {
        return current;
      }

      current = current.parentElement;
      depth++;
    }

    // Fallback: broader search
    current = startEl;
    depth = 0;
    while (current && current !== document.documentElement && depth < 20) {
      // Look for forms or sections that contain multiple email fields
      var inputs = current.querySelectorAll
        ? current.querySelectorAll('input[type="email"], input[name*="to"], textarea, [contenteditable="true"]')
        : [];
      if (inputs.length >= 2) {
        return current;
      }
      current = current.parentElement;
      depth++;
    }

    return null;
  }

  function findEmailBody(container) {
    if (!container || !container.querySelectorAll) return null;

    // 1. Contenteditable divs (Gmail primary)
    var editables = container.querySelectorAll('[contenteditable="true"]');
    for (var i = 0; i < editables.length; i++) {
      var el = editables[i];
      // Skip tiny ones (toolbars, single-line inputs)
      if ((el.offsetWidth > 120 || el.offsetHeight > 60) &&
          el.getAttribute('role') !== 'combobox') {
        return el;
      }
    }

    // 2. Role="textbox" (Gmail alternate)
    var textboxes = container.querySelectorAll('[role="textbox"]');
    for (var j = 0; j < textboxes.length; j++) {
      var tb = textboxes[j];
      if (tb.offsetWidth > 120 || tb.offsetHeight > 60) {
        return tb;
      }
    }

    // 3. Textareas (Yahoo, Outlook classic)
    var textareas = container.querySelectorAll('textarea');
    for (var k = 0; k < textareas.length; k++) {
      var ta = textareas[k];
      if (ta.offsetWidth > 120 || ta.offsetHeight > 60) {
        return ta;
      }
    }

    return null;
  }

  function getEmailBodyText(bodyEl) {
    if (!bodyEl) return '';

    // Clone to avoid mutating the real DOM
    var clone = bodyEl.cloneNode(true);

    // Remove quoted reply sections (Gmail, Yahoo, Outlook)
    var quoteSelectors = [
      '.gmail_quote', '.gmail_extra', '.gmail_signature',
      '.yahoo_quoted', '.yahoo_quoted_text',
      'blockquote[type="cite"]',
      '.ms-editor-quote', '.ms-editor-signature',
      '[class*="gmail_quote"]', '[class*="yahoo_quote"]',
      'blockquote', '.x_gmail_quote'
    ];

    try {
      quoteSelectors.forEach(function (sel) {
        try {
          var els = clone.querySelectorAll(sel);
          for (var i = 0; i < els.length; i++) {
            els[i].remove();
          }
        } catch (e) { /* invalid selector, skip */ }
      });
    } catch (e) { /* ignore */ }

    // Get text
    var text = '';
    if (clone.tagName && (clone.tagName.toLowerCase() === 'textarea' || clone.tagName.toLowerCase() === 'input')) {
      text = clone.value || '';
    } else {
      text = (clone.textContent || clone.innerText || '');
    }

    // Remove lines starting with ">" (plain-text quoting)
    text = text.split('\n')
      .filter(function (line) { return !line.trim().match(/^[>|].*$/); })
      .join('\n')
      .trim();

    return text;
  }

  // ── Attachment Detection ───────────────────────────────────
  function hasAttachments(container) {
    if (!container || !container.querySelectorAll) return false;

    // Strategy 1: Gmail attachment chips contain file size text (KB, MB, GB)
    var allEls = container.querySelectorAll('*');
    for (var i = 0; i < allEls.length; i++) {
      var el = allEls[i];
      var elText = (el.textContent || '').trim();

      // File size pattern in a leaf or near-leaf element
      if (/\d+(\.\d+)?\s*(KB|MB|GB|bytes)\b/i.test(elText)) {
        // Verify a filename with extension is nearby
        var parent = el.parentElement;
        if (parent) {
          var parentText = (parent.textContent || '');
          if (/\.[a-zA-Z0-9]{2,5}\b/.test(parentText)) {
            return true;
          }
        }
      }
    }

    // Strategy 2: File input elements with selected files
    var fileInputs = container.querySelectorAll('input[type="file"]');
    for (var fi = 0; fi < fileInputs.length; fi++) {
      if (fileInputs[fi].files && fileInputs[fi].files.length > 0) {
        return true;
      }
    }

    // Strategy 3: Gmail attachment area (above body, below subject)
    // Look for elements with attachment-related aria labels
    var ariaAttach = container.querySelectorAll(
      '[aria-label*="attach" i], [aria-label*="file" i], [data-tooltip*="attach" i]'
    );
    for (var aa = 0; aa < ariaAttach.length; aa++) {
      var ariaEl = ariaAttach[aa];
      // Must have visible child content (not just an empty wrapper)
      if (ariaEl.children.length > 0 && ariaEl.textContent.trim().length > 2) {
        return true;
      }
    }

    // Strategy 4: Scan for filename patterns in non-body elements
    // (attachment chips show filename.ext + size)
    var body = findEmailBody(container);
    var bodyTextLower = body ? (body.textContent || '').toLowerCase() : '';

    for (var j = 0; j < allEls.length; j++) {
      var candidate = allEls[j];
      // Skip the body element itself
      if (candidate === body || (body && body.contains(candidate) && candidate !== body)) {
        // Only check elements outside the body area
        continue;
      }
      var candText = (candidate.textContent || '').trim();
      // Attachment chip pattern: "filename.ext" AND file size or remove icon
      if (/\b[\w\-]+\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|zip|rar|txt|csv|mp[34]|mov|avi|html?|json|xml)\b/i.test(candText)) {
        // Check for file size nearby or remove button
        if (/\d+\s*(KB|MB|GB)/i.test(candText) || candidate.querySelector('[aria-label*="remove" i]')) {
          return true;
        }
      }
    }

    // Strategy 5: Check for Gmail's inline Drive attachment links
    var driveLinks = container.querySelectorAll('a[href*="drive.google.com"], a[href*="docs.google.com"]');
    if (driveLinks.length > 0) {
      // Google Drive links in compose usually mean an attachment was added
      // Only count if there are elements suggesting it's an actual attachment
      for (var dl = 0; dl < driveLinks.length; dl++) {
        var linkText = (driveLinks[dl].textContent || '').trim();
        if (linkText.length > 3 && !linkText.includes('http')) {
          return true;
        }
      }
    }

    return false;
  }

  // ── URL Detection ──────────────────────────────────────────
  function hasURLs(text) {
    if (!text) return false;

    var urlPatterns = [
      /https?:\/\/[^\s]{3,}/gi,
      /www\.[a-zA-Z0-9][^\s]{2,}\.[a-zA-Z]{2,}/gi
    ];

    for (var i = 0; i < urlPatterns.length; i++) {
      if (urlPatterns[i].test(text)) {
        return true;
      }
    }

    return false;
  }

  // ── CC Detection ───────────────────────────────────────────
  function hasCC(container) {
    if (!container || !container.querySelectorAll) return false;

    // Strategy 1: Look for CC-labeled inputs
    var inputs = container.querySelectorAll('input, textarea, [contenteditable="true"]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var placeholder = (el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
      var name = (el.getAttribute('name') || '').toLowerCase();
      var id = (el.id || '').toLowerCase();

      if (placeholder.includes('cc') || name.includes('cc') || id.includes('cc')) {
        var val = (el.value || el.textContent || el.innerText || '').trim();
        if (val.length > 0 && !/^cc[\s:]*$/i.test(val)) {
          return true;
        }
      }
    }

    // Strategy 2: Gmail CC row — find "CC" label text then check sibling content
    var allTextNodes = container.querySelectorAll('span, label, div, td, th');
    for (var j = 0; j < allTextNodes.length; j++) {
      var node = allTextNodes[j];
      var nodeText = (node.textContent || '').trim().toLowerCase();

      // Exact "CC" label (not inside a larger word)
      if (nodeText === 'cc' || nodeText === 'cc:') {
        // Check for email pills/chips in the same row or parent
        var parent = node.parentElement;
        if (parent) {
          // Gmail uses email chips: spans with data-email or email attribute
          var chips = parent.querySelectorAll('[data-email], [email], [data-hovercard-id]');
          if (chips.length > 0) return true;

          // Check for email addresses in sibling content
          var parentText = (parent.textContent || '');
          if (/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(parentText) &&
              !/^cc[\s:]*$/i.test(parentText.trim())) {
            return true;
          }
        }
      }
    }

    // Strategy 3: Outlook/Yahoo CC — find visible CC input area
    var ccContainers = container.querySelectorAll(
      '[class*="cc" i], [id*="cc" i], [name*="cc" i], [aria-label*="cc" i]'
    );
    for (var k = 0; k < ccContainers.length; k++) {
      var ccEl = ccContainers[k];
      var emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
      var ccText = (ccEl.value || ccEl.textContent || '').trim();
      if (emailRegex.test(ccText) && ccText.length > 5) {
        return true;
      }
    }

    return false;
  }

  // ── Trigger Checking ───────────────────────────────────────
  function checkTriggers(bodyText, container) {
    var issues = [];
    var lowerBody = bodyText.toLowerCase();

    for (var i = 0; i < patterns.length; i++) {
      var pattern = patterns[i];
      if (!pattern.enabled) continue;

      // Check if any phrase matches
      var phraseFound = false;
      for (var j = 0; j < pattern.phrases.length; j++) {
        if (lowerBody.indexOf(pattern.phrases[j].toLowerCase()) !== -1) {
          phraseFound = true;
          break;
        }
      }
      if (!phraseFound) continue;

      // Verify the corresponding element
      var isPresent = false;
      var missingMessage = '';

      switch (pattern.type) {
        case 'file':
          isPresent = hasAttachments(container);
          missingMessage = 'You mentioned attaching a file but no file is attached.';
          break;
        case 'link':
          isPresent = hasURLs(bodyText);
          missingMessage = 'You mentioned a link but no URL was found in your message.';
          break;
        case 'cc':
          isPresent = hasCC(container);
          missingMessage = 'You mentioned CC\'ing someone but the CC field appears to be empty.';
          break;
        default:
          continue;
      }

      if (!isPresent) {
        issues.push({
          pattern: pattern,
          message: missingMessage
        });
      }
    }

    return issues;
  }

  // ── Modal ──────────────────────────────────────────────────
  function createModalIfNeeded() {
    if (modalOverlay) return;

    // Overlay
    modalOverlay = document.createElement('div');
    modalOverlay.id = '__seg_overlay';
    modalOverlay.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.45);z-index:2147483646;' +
      'display:none;align-items:center;justify-content:center;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    // Modal
    modalElement = document.createElement('div');
    modalElement.id = '__seg_modal';
    modalElement.style.cssText =
      'background:#fff;border-radius:14px;padding:24px;' +
      'max-width:440px;width:92%;box-shadow:0 24px 80px rgba(0,0,0,0.35);' +
      'z-index:2147483647;position:relative;';

    modalOverlay.appendChild(modalElement);

    // Wait for body
    function appendWhenReady() {
      if (document.body) {
        document.body.appendChild(modalOverlay);
      } else {
        setTimeout(appendWhenReady, 50);
      }
    }
    appendWhenReady();

    // Close on overlay click
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && warningActive) {
        hideModal();
      }
    }, true);
  }

  function showModal(issues, onConfirm, onCancel) {
    if (warningActive) return;
    warningActive = true;

    createModalIfNeeded();

    var title = issues.length === 1
      ? 'Missing Element Detected'
      : issues.length + ' Issues Detected';

    var iconColor = '#ea4335';

    var issuesHTML = '';
    for (var i = 0; i < issues.length; i++) {
      var marginBottom = i < issues.length - 1 ? 'margin-bottom:12px;' : '';
      issuesHTML +=
        '<div style="' + marginBottom + 'padding:12px 14px;background:#fef7e0;' +
        'border-radius:8px;border-left:3px solid #f9ab00;font-size:13px;' +
        'color:#3c4043;line-height:1.5;">' +
        issues[i].message +
        '</div>';
    }

    modalElement.innerHTML =
      '<div style="display:flex;align-items:flex-start;margin-bottom:16px;">' +
        '<div style="background:' + iconColor + ';min-width:36px;height:36px;' +
          'border-radius:10px;display:flex;align-items:center;justify-content:center;' +
          'margin-right:12px;font-size:20px;line-height:1;">&#x26A0;</div>' +
        '<div>' +
          '<div style="font-size:16px;font-weight:600;color:#202124;margin-bottom:2px;">' + title + '</div>' +
          '<div style="font-size:11px;color:#1a73e8;font-weight:500;">Smart Email Guard</div>' +
        '</div>' +
      '</div>' +

      '<div style="margin-bottom:20px;">' + issuesHTML + '</div>' +

      '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
        '<button id="__seg_cancel" style="padding:10px 22px;border:1px solid #dadce0;' +
          'border-radius:8px;background:#fff;color:#5f6368;font-size:13px;' +
          'font-weight:500;cursor:pointer;font-family:inherit;transition:background 0.15s;">' +
          'Go Back</button>' +
        '<button id="__seg_confirm" style="padding:10px 22px;border:none;' +
          'border-radius:8px;background:#1a73e8;color:#fff;font-size:13px;' +
          'font-weight:500;cursor:pointer;font-family:inherit;transition:background 0.15s;">' +
          'Send Anyway</button>' +
      '</div>';

    // Button hover effects
    var cancelBtn = document.getElementById('__seg_cancel');
    var confirmBtn = document.getElementById('__seg_confirm');

    cancelBtn.addEventListener('mouseenter', function () { cancelBtn.style.background = '#f1f3f4'; });
    cancelBtn.addEventListener('mouseleave', function () { cancelBtn.style.background = '#fff'; });
    confirmBtn.addEventListener('mouseenter', function () { confirmBtn.style.background = '#1557b0'; });
    confirmBtn.addEventListener('mouseleave', function () { confirmBtn.style.background = '#1a73e8'; });

    cancelBtn.addEventListener('click', function () {
      hideModal();
      if (onCancel) onCancel();
    });

    confirmBtn.addEventListener('click', function () {
      hideModal();
      if (onConfirm) onConfirm();
    });

    modalOverlay.style.display = 'flex';
  }

  function hideModal() {
    warningActive = false;
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
    }
  }

  // ── Click Interception ─────────────────────────────────────
  var bypassNextClick = false;

  function handleClick(event) {
    // Allow synthetic clicks (retriggered after user confirms)
    if (bypassNextClick) {
      bypassNextClick = false;
      log('Bypassing click (retrigger)');
      return;
    }

    if (warningActive) return;

    var target = event.target;
    if (!target) return;

    // Walk up to find a Send button
    var sendButton = null;
    var el = target;
    var depth = 0;
    while (el && depth < 6) {
      if (isSendButton(el)) {
        sendButton = el;
        break;
      }
      el = el.parentElement;
      depth++;
    }

    if (!sendButton) return;
    log('Send button detected');

    // Find compose container
    var container = findComposeContainer(sendButton);
    if (!container) {
      log('No compose container found');
      return;
    }

    // Find email body
    var bodyEl = findEmailBody(container);
    if (!bodyEl) {
      log('No email body found');
      return;
    }

    var bodyText = getEmailBodyText(bodyEl);
    log('Body text (' + bodyText.length + ' chars):', bodyText.substring(0, 150));

    // Run checks
    var issues = checkTriggers(bodyText, container);

    if (issues.length === 0) {
      log('No issues — allowing send');
      return;
    }

    log('Issues found:', issues.length);

    // Block the click
    event.stopPropagation();
    event.preventDefault();
    event.stopImmediatePropagation();

    pendingSendButton = sendButton;

    showModal(
      issues,
      // On confirm: re-trigger the send
      function () {
        if (pendingSendButton) {
          var btn = pendingSendButton;
          pendingSendButton = null;
          log('User confirmed — retriggering send');
          bypassNextClick = true;
          // Small delay to ensure modal is hidden
          setTimeout(function () {
            btn.click();
          }, 80);
        }
      },
      // On cancel
      function () {
        pendingSendButton = null;
        log('User cancelled — send blocked');
      }
    );
  }

  // ── Keyboard Shortcut Interception ─────────────────────────
  // Gmail: Ctrl+Enter sends. Intercept this too.
  function handleKeydown(event) {
    if (warningActive) {
      // Block keyboard shortcuts while modal is shown
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      return;
    }

    // Ctrl+Enter or Cmd+Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      // Find the focused compose window
      var activeEl = document.activeElement;
      if (!activeEl) return;

      // Check if we're in a compose window
      var container = findComposeContainer(activeEl);
      if (!container) return;

      var bodyEl = findEmailBody(container);
      if (!bodyEl) return;

      var bodyText = getEmailBodyText(bodyEl);
      var issues = checkTriggers(bodyText, container);

      if (issues.length === 0) return;

      log('Keyboard send blocked — issues:', issues.length);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // Find the Send button for potential retrigger
      var sendBtn = findSendButtonInContainer(container);
      pendingSendButton = sendBtn;

      showModal(
        issues,
        function () {
          if (pendingSendButton) {
            var btn = pendingSendButton;
            pendingSendButton = null;
            log('User confirmed — retriggering via keyboard');
            bypassNextClick = true;
            setTimeout(function () {
              btn.click();
            }, 80);
          }
        },
        function () {
          pendingSendButton = null;
        }
      );
    }
  }

  function findSendButtonInContainer(container) {
    if (!container) return null;
    var buttons = container.querySelectorAll(
      'div[role="button"], button, span[role="button"]'
    );
    for (var i = 0; i < buttons.length; i++) {
      if (isSendButton(buttons[i])) {
        return buttons[i];
      }
    }
    return null;
  }

  // ── Storage Change Listener ─────────────────────────────────
  function watchStorageChanges() {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      if (namespace === 'sync' && changes.patterns) {
        patterns = changes.patterns.newValue || getDefaultPatterns();
        log('Patterns updated from storage:', patterns.length, 'patterns');
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    loadPatterns().then(function () {
      log('Initialized with', patterns.length, 'patterns');

      // Click interception (capture phase)
      document.addEventListener('click', handleClick, true);

      // Keyboard shortcut interception (capture phase)
      document.addEventListener('keydown', handleKeydown, true);

      // Watch for storage changes from popup
      watchStorageChanges();
    }).catch(function (err) {
      console.error('[Smart Email Guard] Init error:', err);
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
