/**
 * Popup UI controller
 */

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadAndDisplayGroups();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById('saveAllBtn').addEventListener('click', handleSaveAllTabs);
  document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);
}

async function handleSaveAllTabs() {
  try {
    await browser.runtime.sendMessage({ action: 'saveAllTabs' });
    await loadAndDisplayGroups();
  } catch (error) {
    console.error('Error saving tabs:', error);
  }
}

async function loadAndDisplayGroups() {
  try {
    const result = await browser.storage.local.get('tabGroups');
    const groups = result.tabGroups || [];
    
    displayGroups(groups);
    updateStats(groups);
  } catch (error) {
    console.error('Error loading groups:', error);
  }
}

function updateStats(groups) {
  const totalTabs = groups.reduce((sum, group) => sum + group.tabs.length, 0);
  document.getElementById('groupCount').textContent = groups.length;
  document.getElementById('tabCount').textContent = totalTabs;
}

function displayGroups(groups) {
  const groupsList = document.getElementById('groupsList');
  const emptyState = document.getElementById('emptyState');
  
  if (groups.length === 0) {
    groupsList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  groupsList.innerHTML = groups.map(group => createGroupHTML(group)).join('');
  
  attachGroupEventListeners();
}

function createGroupHTML(group) {
  const date = new Date(group.timestamp);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return `
    <div class="group-card" data-group-id="${group.id}">
      <div class="group-header">
        <div class="group-info">
          <div class="group-name" data-group-id="${group.id}">${escapeHtml(group.name)}</div>
          <div class="group-meta">${group.tabs.length} tabs • ${formattedDate}</div>
        </div>
        <div class="group-actions">
          <button class="btn-icon restore-group" data-group-id="${group.id}" title="Restore all tabs">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
            </svg>
          </button>
          <button class="btn-icon edit-group" data-group-id="${group.id}" title="Edit group name">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
          </button>
          <button class="btn-icon danger delete-group" data-group-id="${group.id}" title="Delete group">
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="tab-list">
        ${group.tabs.map((tab, index) => createTabHTML(tab, group.id, index)).join('')}
      </div>
    </div>
  `;
}

function createTabHTML(tab, groupId, index) {
  const faviconHTML = tab.favIconUrl 
    ? `<img src="${escapeHtml(tab.favIconUrl)}" class="tab-favicon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
       <div class="tab-favicon-placeholder" style="display:none;"></div>`
    : `<div class="tab-favicon-placeholder"></div>`;
  
  return `
    <div class="tab-item" data-group-id="${groupId}" data-tab-index="${index}">
      ${faviconHTML}
      <div class="tab-content">
        <div class="tab-title" data-url="${escapeHtml(tab.url)}">${escapeHtml(tab.title)}</div>
        <div class="tab-url">${escapeHtml(tab.url)}</div>
      </div>
      <button class="tab-close" data-group-id="${groupId}" data-tab-index="${index}" title="Remove tab">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  `;
}

function attachGroupEventListeners() {
  // Restore group
  document.querySelectorAll('.restore-group').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const groupId = e.currentTarget.dataset.groupId;
      const result = await browser.storage.local.get('tabGroups');
      const group = result.tabGroups.find(g => g.id === groupId);
      if (group) {
        await browser.runtime.sendMessage({ action: 'restoreGroup', tabs: group.tabs });
      }
    });
  });
  
  // Delete group
  document.querySelectorAll('.delete-group').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const groupId = e.currentTarget.dataset.groupId;
      if (confirm('Delete this group?')) {
        await deleteGroup(groupId);
        await loadAndDisplayGroups();
      }
    });
  });
  
  // Edit group name
  document.querySelectorAll('.edit-group').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const groupId = e.currentTarget.dataset.groupId;
      const nameElement = document.querySelector(`.group-name[data-group-id="${groupId}"]`);
      const currentName = nameElement.textContent;
      
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'group-name-input';
      input.value = currentName;
      
      nameElement.replaceWith(input);
      input.focus();
      input.select();
      
      const saveEdit = async () => {
        const newName = input.value.trim() || currentName;
        await updateGroupName(groupId, newName);
        await loadAndDisplayGroups();
      };
      
      input.addEventListener('blur', saveEdit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
      });
    });
  });
  
  // Click group name to toggle
  document.querySelectorAll('.group-name').forEach(name => {
    name.addEventListener('click', (e) => {
      const groupCard = e.target.closest('.group-card');
      const tabList = groupCard.querySelector('.tab-list');
      tabList.style.display = tabList.style.display === 'none' ? 'block' : 'none';
    });
  });
  
  // Restore individual tab
  document.querySelectorAll('.tab-title').forEach(title => {
    title.addEventListener('click', async (e) => {
      const url = e.currentTarget.dataset.url;
      await browser.runtime.sendMessage({ action: 'restoreTab', url });
    });
  });
  
  // Delete individual tab
  document.querySelectorAll('.tab-close').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const groupId = e.currentTarget.dataset.groupId;
      const tabIndex = parseInt(e.currentTarget.dataset.tabIndex);
      await deleteTab(groupId, tabIndex);
      await loadAndDisplayGroups();
    });
  });
}

async function deleteGroup(groupId) {
  const result = await browser.storage.local.get('tabGroups');
  const groups = result.tabGroups.filter(g => g.id !== groupId);
  await browser.storage.local.set({ tabGroups: groups });
}

async function deleteTab(groupId, tabIndex) {
  const result = await browser.storage.local.get('tabGroups');
  const groups = result.tabGroups;
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.tabs.splice(tabIndex, 1);
    if (group.tabs.length === 0) {
      await deleteGroup(groupId);
    } else {
      await browser.storage.local.set({ tabGroups: groups });
    }
  }
}

async function updateGroupName(groupId, newName) {
  const result = await browser.storage.local.get('tabGroups');
  const groups = result.tabGroups;
  const group = groups.find(g => g.id === groupId);
  if (group) {
    group.name = newName;
    await browser.storage.local.set({ tabGroups: groups });
  }
}

async function handleClearAll() {
  if (confirm('Delete all saved tab groups? This cannot be undone.')) {
    await browser.storage.local.set({ tabGroups: [] });
    await loadAndDisplayGroups();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for storage changes
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.tabGroups) {
    loadAndDisplayGroups();
  }
});
