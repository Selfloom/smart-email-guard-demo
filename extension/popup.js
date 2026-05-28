// Smart Email Guard - Popup Script
// Manages pattern toggling, custom patterns, and storage sync.

(function () {
  'use strict';

  // ── Default Patterns ───────────────────────────────────────
  function getDefaults() {
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

  // ── Storage Helpers ────────────────────────────────────────
  function getStorage(keys) {
    return new Promise(function (resolve) {
      chrome.storage.sync.get(keys, function (result) {
        resolve(result);
      });
    });
  }

  function setStorage(obj) {
    return new Promise(function (resolve) {
      chrome.storage.sync.set(obj, function () {
        resolve();
      });
    });
  }

  // ── State ──────────────────────────────────────────────────
  var patterns = [];

  // ── Type Icons ─────────────────────────────────────────────
  var typeIcons = {
    'file': '&#x1F4CE;',  // paperclip
    'link': '&#x1F517;',  // link
    'cc': '&#x1F465;'     // people
  };

  var typeLabels = {
    'file': 'File',
    'link': 'Link',
    'cc': 'CC'
  };

  // ── Render ─────────────────────────────────────────────────
  function render() {
    var defaults = patterns.filter(function (p) { return p.isDefault; });
    var customs = patterns.filter(function (p) { return !p.isDefault; });

    renderPatternList('default-patterns', defaults, true);
    renderPatternList('custom-patterns', customs, false);
  }

  function renderPatternList(containerId, patternList, isDefault) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (patternList.length === 0 && !isDefault) {
      container.innerHTML = '<div class="empty-state">No custom patterns yet. Add one below.</div>';
      return;
    }

    patternList.forEach(function (pattern) {
      var row = createPatternRow(pattern, isDefault);
      container.appendChild(row);
    });
  }

  function createPatternRow(pattern, isDefault) {
    var row = document.createElement('div');
    row.className = 'pattern-row';

    // ── Toggle Switch ──
    var toggle = document.createElement('label');
    toggle.className = 'toggle';
    toggle.title = pattern.enabled ? 'Disable' : 'Enable';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = pattern.enabled;
    checkbox.addEventListener('change', function () {
      togglePattern(pattern.id, checkbox.checked);
    });

    var slider = document.createElement('span');
    slider.className = 'toggle-slider';

    toggle.appendChild(checkbox);
    toggle.appendChild(slider);

    // ── Pattern Info ──
    var info = document.createElement('div');
    info.className = 'pattern-info';

    var phrasesDiv = document.createElement('div');
    phrasesDiv.className = 'pattern-phrases';
    var displayPhrases = pattern.phrases.slice(0, 2).join(', ');
    if (pattern.phrases.length > 2) {
      displayPhrases += ' +' + (pattern.phrases.length - 2);
    }
    phrasesDiv.textContent = displayPhrases;
    phrasesDiv.title = pattern.phrases.join('\n');

    info.appendChild(phrasesDiv);

    // ── Type Badge ──
    var badge = document.createElement('span');
    badge.className = 'pattern-type-badge';
    badge.innerHTML = typeIcons[pattern.type] || '&#x2753;';
    badge.title = typeLabels[pattern.type] || pattern.type;

    // ── Delete Button (custom only) ──
    var deleteBtn = null;
    if (!isDefault) {
      deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.title = 'Delete pattern';
      deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        deletePattern(pattern.id);
      });
    }

    row.appendChild(toggle);
    row.appendChild(info);
    row.appendChild(badge);
    if (deleteBtn) row.appendChild(deleteBtn);

    return row;
  }

  // ── Actions ────────────────────────────────────────────────
  function togglePattern(id, enabled) {
    var pattern = patterns.find(function (p) { return p.id === id; });
    if (pattern) {
      pattern.enabled = enabled;
      setStorage({ patterns: patterns }).catch(function (err) {
        console.error('[SEG Popup] Failed to save:', err);
        // Revert on failure
        pattern.enabled = !enabled;
        render();
      });
    }
  }

  function deletePattern(id) {
    patterns = patterns.filter(function (p) { return p.id !== id; });
    setStorage({ patterns: patterns }).then(function () {
      render();
    }).catch(function (err) {
      console.error('[SEG Popup] Failed to delete:', err);
    });
  }

  function addCustomPattern() {
    var phraseInput = document.getElementById('custom-phrase');
    var typeSelect = document.getElementById('custom-type');
    var errorEl = document.getElementById('add-error');

    var phrase = phraseInput.value.trim();
    var type = typeSelect.value;

    // Validation
    if (!phrase) {
      showError('Please enter a trigger phrase.');
      return;
    }

    if (phrase.length < 2) {
      showError('Phrase must be at least 2 characters.');
      return;
    }

    // Check for duplicates
    var lowerPhrase = phrase.toLowerCase();
    for (var i = 0; i < patterns.length; i++) {
      for (var j = 0; j < patterns[i].phrases.length; j++) {
        if (patterns[i].phrases[j].toLowerCase() === lowerPhrase) {
          showError('This phrase already exists.');
          return;
        }
      }
    }

    var id = 'custom-' + Date.now();
    patterns.push({
      id: id,
      phrases: [phrase],
      type: type,
      enabled: true,
      isDefault: false
    });

    setStorage({ patterns: patterns }).then(function () {
      phraseInput.value = '';
      errorEl.style.display = 'none';
      render();
    }).catch(function (err) {
      console.error('[SEG Popup] Failed to save custom pattern:', err);
      showError('Failed to save. Please try again.');
    });
  }

  function resetDefaults() {
    if (!confirm('Reset all patterns to defaults? Custom patterns will be lost.')) return;

    patterns = getDefaults();
    setStorage({ patterns: patterns }).then(function () {
      render();
    }).catch(function (err) {
      console.error('[SEG Popup] Failed to reset:', err);
    });
  }

  function showUpgradeMessage() {
    // Open Buy Me a Coffee support page in a new tab
    window.open('https://buymeacoffee.com/selfloom', '_blank');
    var msgEl = document.getElementById('pro-msg');
    msgEl.textContent = 'Opening support page\u2026 Smart Email Guard is free. Your support funds Pro development. Thank you!';
    msgEl.style.display = 'block';
    setTimeout(function () {
      msgEl.style.display = 'none';
    }, 5000);
  }

  function showError(message) {
    var errorEl = document.getElementById('add-error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(function () {
      errorEl.style.display = 'none';
    }, 3000);
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    getStorage(['patterns']).then(function (result) {
      if (result.patterns && result.patterns.length > 0) {
        patterns = result.patterns;
      } else {
        patterns = getDefaults();
        setStorage({ patterns: patterns });
      }
      render();
    }).catch(function (err) {
      console.error('[SEG Popup] Failed to load patterns:', err);
      patterns = getDefaults();
      render();
    });

    // Event listeners
    document.getElementById('add-custom-btn').addEventListener('click', addCustomPattern);

    // Enter key in the phrase input triggers add
    document.getElementById('custom-phrase').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        addCustomPattern();
      }
    });

    document.getElementById('upgrade-btn').addEventListener('click', showUpgradeMessage);
    document.getElementById('reset-btn').addEventListener('click', resetDefaults);
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
