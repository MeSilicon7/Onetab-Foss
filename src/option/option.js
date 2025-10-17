/**
 * Options page controller for import/export functionality
 */

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadStatistics();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('generateExportBtn').addEventListener('click', handleGenerateExport);
  document.getElementById('copyExportBtn').addEventListener('click', handleCopyExport);
  document.getElementById('importBtn').addEventListener('click', handleImport);
  document.getElementById('clearImportBtn').addEventListener('click', handleClearImport);
}

/**
 * Generate export data and display in textarea
 */
async function handleGenerateExport() {
  try {
    const result = await browser.storage.local.get('tabGroups');
    const tabGroups = result.tabGroups || [];
    
    if (tabGroups.length === 0) {
      showStatus('exportStatus', 'No data to export', 'error');
      return;
    }
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      groups: tabGroups
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    document.getElementById('exportData').value = jsonString;
    document.getElementById('copyExportBtn').style.display = 'inline-flex';
    
    showStatus('exportStatus', `Successfully generated export data with ${tabGroups.length} groups`, 'success');
  } catch (error) {
    console.error('Error generating export:', error);
    showStatus('exportStatus', 'Error generating export data', 'error');
  }
}

/**
 * Copy export data to clipboard
 */
async function handleCopyExport() {
  const exportData = document.getElementById('exportData').value;
  
  if (!exportData) {
    showStatus('exportStatus', 'No data to copy', 'error');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(exportData);
    showStatus('exportStatus', 'Copied to clipboard!', 'success');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.getElementById('exportData');
    textarea.select();
    document.execCommand('copy');
    showStatus('exportStatus', 'Copied to clipboard!', 'success');
  }
}

/**
 * Import data from textarea
 */
async function handleImport() {
  const importData = document.getElementById('importData').value.trim();
  
  if (!importData) {
    showStatus('importStatus', 'Please paste data to import', 'error');
    return;
  }
  
  try {
    const data = JSON.parse(importData);
    
    // Validate data structure
    if (!data.groups || !Array.isArray(data.groups)) {
      showStatus('importStatus', 'Invalid data format', 'error');
      return;
    }
    
    // Validate each group
    for (const group of data.groups) {
      if (!group.id || !group.name || !Array.isArray(group.tabs)) {
        showStatus('importStatus', 'Invalid group structure in data', 'error');
        return;
      }
    }
    
    // Confirm before importing
    const confirmMessage = `This will import ${data.groups.length} groups. Continue?`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Get existing groups
    const result = await browser.storage.local.get('tabGroups');
    const existingGroups = result.tabGroups || [];
    
    // Merge imported groups with existing ones
    const mergedGroups = [...data.groups, ...existingGroups];
    
    // Save to storage
    await browser.storage.local.set({ tabGroups: mergedGroups });
    
    showStatus('importStatus', `Successfully imported ${data.groups.length} groups!`, 'success');
    document.getElementById('importData').value = '';
    await loadStatistics();
  } catch (error) {
    console.error('Error importing data:', error);
    showStatus('importStatus', 'Error: Invalid JSON format', 'error');
  }
}

/**
 * Clear import textarea
 */
function handleClearImport() {
  document.getElementById('importData').value = '';
  hideStatus('importStatus');
}

/**
 * Load and display statistics
 */
async function loadStatistics() {
  try {
    const result = await browser.storage.local.get('tabGroups');
    const groups = result.tabGroups || [];
    const totalTabs = groups.reduce((sum, group) => sum + group.tabs.length, 0);
    
    document.getElementById('totalGroups').textContent = groups.length;
    document.getElementById('totalTabs').textContent = totalTabs;
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

/**
 * Show status message
 */
function showStatus(elementId, message, type) {
  const statusElement = document.getElementById(elementId);
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  
  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => hideStatus(elementId), 3000);
  }
}

/**
 * Hide status message
 */
function hideStatus(elementId) {
  const statusElement = document.getElementById(elementId);
  statusElement.className = 'status-message';
}

// Listen for storage changes to update statistics
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.tabGroups) {
    loadStatistics();
  }
});
