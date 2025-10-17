/**
 * Storage utility for managing tab groups in browser storage
 */

const STORAGE_KEY = 'tabGroups';

/**
 * Get all saved tab groups
 * @returns {Promise<Array>} Array of tab groups
 */
async function getTabGroups() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Error getting tab groups:', error);
    return [];
  }
}

/**
 * Save a new tab group
 * @param {Object} tabGroup - The tab group to save
 * @returns {Promise<void>}
 */
async function saveTabGroup(tabGroup) {
  try {
    const groups = await getTabGroups();
    const newGroup = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...tabGroup
    };
    groups.unshift(newGroup);
    await browser.storage.local.set({ [STORAGE_KEY]: groups });
  } catch (error) {
    console.error('Error saving tab group:', error);
    throw error;
  }
}

/**
 * Delete a tab group by ID
 * @param {string} groupId - The ID of the group to delete
 * @returns {Promise<void>}
 */
async function deleteTabGroup(groupId) {
  try {
    const groups = await getTabGroups();
    const filtered = groups.filter(group => group.id !== groupId);
    await browser.storage.local.set({ [STORAGE_KEY]: filtered });
  } catch (error) {
    console.error('Error deleting tab group:', error);
    throw error;
  }
}

/**
 * Delete a specific tab from a group
 * @param {string} groupId - The ID of the group
 * @param {number} tabIndex - The index of the tab to delete
 * @returns {Promise<void>}
 */
async function deleteTab(groupId, tabIndex) {
  try {
    const groups = await getTabGroups();
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      groups[groupIndex].tabs.splice(tabIndex, 1);
      if (groups[groupIndex].tabs.length === 0) {
        groups.splice(groupIndex, 1);
      }
      await browser.storage.local.set({ [STORAGE_KEY]: groups });
    }
  } catch (error) {
    console.error('Error deleting tab:', error);
    throw error;
  }
}

/**
 * Update a tab group's name
 * @param {string} groupId - The ID of the group
 * @param {string} newName - The new name for the group
 * @returns {Promise<void>}
 */
async function updateGroupName(groupId, newName) {
  try {
    const groups = await getTabGroups();
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.name = newName;
      await browser.storage.local.set({ [STORAGE_KEY]: groups });
    }
  } catch (error) {
    console.error('Error updating group name:', error);
    throw error;
  }
}

/**
 * Clear all tab groups
 * @returns {Promise<void>}
 */
async function clearAllGroups() {
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: [] });
  } catch (error) {
    console.error('Error clearing all groups:', error);
    throw error;
  }
}
