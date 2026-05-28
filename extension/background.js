// Smart Email Guard - Background Service Worker
// Initializes default patterns on first install

const DEFAULT_PATTERNS = [
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['patterns'], (result) => {
    if (!result.patterns || result.patterns.length === 0) {
      chrome.storage.sync.set({ patterns: DEFAULT_PATTERNS });
    }
  });
});
