let autosaveEnabled = true;
let autosaveInterval = 10000;
let backgroundColor = '#f2f2f2';
let tabColor = '#4CAF50';
let animationsEnabled = true;
let lowEndModeEnabled = false;
let itemsPerPage = 10;
let dragDropEnabled = true;
let fastFileDeleteEnabled = false;
let fastRowsDeleteEnabled = true;
let floatColumnsEnabled = true;
let enableRowDragging = true;
let enableMoreBullets = false;
let historyLimit = 100;

function toggleAutosave() {
    BrawlStarsEditor.settings.autosaveEnabled = document.getElementById('autosave-toggle').checked;
    saveData();
}

function updateAutosaveInterval() {
    BrawlStarsEditor.settings.autosaveInterval = parseInt(document.getElementById('autosave-interval').value);
    saveData();
}

function updateBackgroundColor() {
    backgroundColor = document.getElementById('background-color-picker').value;
    document.body.style.backgroundColor = backgroundColor;
    saveData();
}

function updateTabColor() {
    tabColor = document.getElementById('tab-color-picker').value;
    document.querySelectorAll('th').forEach(th => {
        th.style.backgroundColor = tabColor;
    });
    saveData();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    saveData();
}

function toggleAnimations() {
    animationsEnabled = document.getElementById('animations-toggle').checked;
    saveData();
}

function toggleFloatingArrows() {
    const floatingArrows = document.getElementById('floating-arrows');
    floatingArrows.style.display = document.getElementById('show-arrows-toggle').checked ? 'block' : 'none';
    saveData();
}

function toggleLowEndMode() {
    lowEndModeEnabled = document.getElementById('low-end-mode-toggle').checked;
    saveData();
}

function updateItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('items-per-page').value);
    populateTable();
    saveData();
}

function updateHistoryLimit() {
    historyLimit = parseInt(document.getElementById('history-limit').value);
    saveData();
}

function toggleSettingsFloat() {
    const settingsPopout = document.getElementById('settings-popout');
    settingsPopout.classList.toggle('settings-float');
    saveData();
}

function toggleDragDrop() {
    dragDropEnabled = document.getElementById('drag-drop-toggle').checked;
    const dropbox = document.getElementById('dropbox');
    dropbox.style.display = dragDropEnabled ? 'block' : 'none';
    saveData();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function toggleFastFileDelete() {
    BrawlStarsEditor.settings.fastFileDeleteEnabled = document.getElementById('fast-file-delete-toggle').checked;
    saveData();
}

function toggleFastRowsDelete() {
    BrawlStarsEditor.settings.fastRowsDeleteEnabled = document.getElementById('fast-rows-delete-toggle').checked;
    saveData();
}

function toggleFloatColumns() {
    BrawlStarsEditor.settings.floatColumnsEnabled = document.getElementById('float-columns-toggle').checked;
    saveData();
}

function toggleRowDragging() {
    BrawlStarsEditor.settings.enableRowDragging = document.getElementById('enable-row-dragging-toggle').checked;
    saveData();
}

function toggleMoreBullets() {
    BrawlStarsEditor.settings.enableMoreBullets = document.getElementById('enable-more-bullets-toggle').checked;
    saveData();
}

function toggleSettings() {
    const settingsPopout = document.getElementById('settings-popout');
    settingsPopout.classList.toggle('show');
}
