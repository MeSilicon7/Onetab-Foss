/**
 * Background script for handling tab operations
 */

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'saveAllTabs') {
    return saveAllTabs();
  } else if (message.action === 'restoreTab') {
    return restoreTab(message.url);
  } else if (message.action === 'restoreGroup') {
    return restoreGroup(message.tabs);
  }
  return Promise.resolve({ success: false });
});

/**
 * Save all tabs in the current window
 */
async function saveAllTabs() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    // Filter out the extension popup and special pages
    const validTabs = tabs.filter(tab => 
      !tab.url.startsWith('about:') && 
      !tab.url.startsWith('moz-extension:')
    );

    if (validTabs.length === 0) {
      return { success: false, message: 'No tabs to save' };
    }

    const tabGroup = {
      name: `Saved ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      tabs: validTabs.map(tab => ({
        title: tab.title,
        url: tab.url,
        favIconUrl: tab.favIconUrl
      }))
    };

    // Save to storage
    const result = await browser.storage.local.get('tabGroups');
    const groups = result.tabGroups || [];
    
    const newGroup = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...tabGroup
    };
    
    groups.unshift(newGroup);
    await browser.storage.local.set({ tabGroups: groups });

    // Close all tabs except pinned ones
    const tabsToClose = validTabs.filter(tab => !tab.pinned).map(tab => tab.id);
    if (tabsToClose.length > 0) {
      await browser.tabs.remove(tabsToClose);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving all tabs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore a single tab
 * @param {string} url - The URL to restore
 */
async function restoreTab(url) {
  try {
    await browser.tabs.create({ url, active: false });
  } catch (error) {
    console.error('Error restoring tab:', error);
  }
}

/**
 * Restore all tabs in a group
 * @param {Array} tabs - Array of tab objects to restore
 */
async function restoreGroup(tabs) {
  try {
    for (const tab of tabs) {
      await browser.tabs.create({ url: tab.url, active: false });
    }
  } catch (error) {
    console.error('Error restoring group:', error);
  }
}

// Initialize context menu
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "save-all-tabs",
    title: "Save All Tabs",
    contexts: ["all"]
  });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-all-tabs") {
    saveAllTabs();
  }
});

console.log('OneTab FOSS background script loaded');
