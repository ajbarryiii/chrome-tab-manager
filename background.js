// background.js

// Helper function to find and return duplicate tabs.
function getDuplicateTabs(callback) {
  chrome.tabs.query({}, (tabs) => {
    const urlMap = new Map();

    tabs.forEach((tab) => {
      const url = tab.url;
      if (urlMap.has(url)) {
        urlMap.get(url).push(tab);
      } else {
        urlMap.set(url, [tab]);
      }
    });

    const duplicates = [];
    urlMap.forEach((tabList, url) => {
      if (tabList.length > 1) {
        duplicates.push({ url, tabs: tabList });
      }
    });

    callback(duplicates);
  });
}

// Function to close the oldest tab from a list of tab IDs.
function closeOlderTab(tabIds, sendResponse) {
  // Sort the tabs by their ID (smaller ID = older tab).
  const oldestTabId = tabIds.sort((a, b) => a - b)[0];

  // Close the oldest tab.
  chrome.tabs.remove(oldestTabId, () => {
    if (chrome.runtime.lastError) {
      console.error("Error closing tab:", chrome.runtime.lastError);
      sendResponse({ success: false });
    } else {
      console.log(`Closed tab with ID: ${oldestTabId}`);
      sendResponse({ success: true });
    }
  });
}

// Listener to handle messages from the popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkDuplicates") {
    getDuplicateTabs((duplicates) => {
      sendResponse({ duplicates });
    });
    return true; // Keeps the messaging channel open for async response.
  } else if (request.action === "closeOlderTab") {
    closeOlderTab(request.tabIds, sendResponse);
    return true; // Keeps the messaging channel open for async response.
  }
});