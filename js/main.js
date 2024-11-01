window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo, '\nColumn:', columnNo, '\nError object:', error);
    return false;
};

window.BrawlStarsEditor = {
    data: {},
    currentFileName: '',
    loadedFiles: [],
    undoStack: [],
    redoStack: [],
    originalData: {},
    projectileData: {},
    settings: {
        autosaveEnabled: true,
        autosaveInterval: 10000,
        backgroundColor: '#121212',
        tabColor: '#66bb6a',
        animationsEnabled: true,
        lowEndModeEnabled: false,
        itemsPerPage: 10,
        dragDropEnabled: true,
        fastFileDeleteEnabled: false,
        fastRowsDeleteEnabled: true,
        floatColumnsEnabled: true,
        enableRowDragging: true,
        enableMoreBullets: false,
        historyLimit: 100,
        darkMode: true,
        enableRowDeleting: false,
        fullWidthEnabled: false,
        showArrows: false
    },
    deleteModeEnabled: false
};

function applySettings() {
    applyDarkMode();
    applyFloatingArrows();
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadSavedData();
        initializeEventListeners();
        initializeSettingsTabs();
        initializeDropbox();
        autosave();
        applySettings();
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('There was an error loading the application. Please refresh the page.');
    }
});

function initializeEventListeners() {
    const elements = [
        { id: 'autosave-toggle', event: 'change', handler: toggleAutosave },
        { id: 'autosave-interval', event: 'change', handler: updateAutosaveInterval },
        { id: 'background-color-picker', event: 'input', handler: updateBackgroundColor },
        { id: 'tab-color-picker', event: 'input', handler: updateTabColor },
        { id: 'dark-mode-toggle', event: 'change', handler: toggleDarkMode },
        { id: 'animations-toggle', event: 'change', handler: toggleAnimations },
        { id: 'show-arrows-toggle', event: 'change', handler: toggleFloatingArrows },
        { id: 'low-end-mode-toggle', event: 'change', handler: toggleLowEndMode },
        { id: 'items-per-page', event: 'input', handler: updateItemsPerPage },
        { id: 'history-limit', event: 'input', handler: updateHistoryLimit },
        { id: 'settings-float-toggle', event: 'change', handler: toggleSettingsFloat },
        { id: 'drag-drop-toggle', event: 'change', handler: toggleDragDrop },
        { id: 'fullscreen-toggle', event: 'change', handler: toggleFullscreen },
        { id: 'fast-file-delete-toggle', event: 'change', handler: toggleFastFileDelete },
        { id: 'fast-rows-delete-toggle', event: 'change', handler: toggleFastRowsDelete },
        { id: 'float-columns-toggle', event: 'change', handler: toggleFloatColumns },
        { id: 'enable-row-dragging-toggle', event: 'change', handler: toggleRowDragging },
        { id: 'enable-more-bullets-toggle', event: 'change', handler: toggleMoreBullets },
        { id: 'enable-row-deleting-toggle', event: 'change', handler: toggleRowDeleting }
    ];

    elements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            el.addEventListener(element.event, element.handler);
            console.log(`Attached ${element.event} listener to ${element.id}`);
        } else {
            console.warn(`Element with id "${element.id}" not found.`);
        }
    });

    // Settings button event listener is handled in settings.js
}

function loadSavedData() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.style.display = 'block';
    }

    return new Promise((resolve) => {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            const loadingProgress = document.querySelector('.loading-progress');
            const loadingText = document.querySelector('.loading-text');
            if (loadingProgress) {
                loadingProgress.style.width = `${progress}%`;
            }
            if (loadingText) {
                loadingText.textContent = `Loading... ${progress}%`;
            }

            if (progress >= 90) {
                clearInterval(progressInterval);
                const savedData = JSON.parse(localStorage.getItem('editorData') || '{}');
                if (Object.keys(savedData).length > 0) {
                    BrawlStarsEditor.data = savedData.data || {};
                    BrawlStarsEditor.currentFileName = savedData.currentFileName || '';
                    BrawlStarsEditor.loadedFiles = savedData.loadedFiles || [];
                    Object.assign(BrawlStarsEditor.settings, savedData.settings);

                    if (loadingProgress) {
                        loadingProgress.style.width = '100%';
                    }

                    setTimeout(() => {
                        if (loadingContainer) {
                            loadingContainer.style.display = 'none';
                        }
                        updateFileButtons();
                        populateTable();
                        applySettings();
                        resolve();
                    }, 200);
                } else {
                    if (loadingContainer) {
                        loadingContainer.style.display = 'none';
                    }
                    resolve();
                }
            }
        }, 50);
    });
}

function updateFileButtons() {
    const fileButtons = document.getElementById('file-buttons');
    if (fileButtons) {
        fileButtons.innerHTML = `
            <div class="trash-bin" id="trash-bin" onclick="toggleDeleteMode()">🗑️</div>
            <div class="file-list"></div>
        `;
        const fileList = fileButtons.querySelector('.file-list');
        if (fileList) {
            BrawlStarsEditor.loadedFiles.forEach(fileName => addFileButtons(fileName, fileList));
        }
    }
}

function addFileButtons(fileName, fileList) {
    const button = document.createElement('button');
    button.textContent = fileName;
    button.classList.add('file-button');
    button.draggable = true;
    button.ondragstart = function (e) {
        e.dataTransfer.setData('text/plain', fileName);
    };
    button.oncontextmenu = function(e) {
        e.preventDefault();
        showContextMenu(e, 'file-context-menu', fileName);
    };
    button.onclick = function() {
        if (BrawlStarsEditor.deleteModeEnabled) {
            if (BrawlStarsEditor.settings.fastFileDeleteEnabled || confirm(`Are you sure you want to delete ${fileName}?`)) {
                promptDeleteFile(fileName);
            }
        } else {
            BrawlStarsEditor.currentFileName = fileName;
            populateTable();
        }
    };
    fileList.appendChild(button);
}

function applyDarkMode() {
    const isDarkMode = BrawlStarsEditor.settings.darkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f2f2f2';
    const elements = document.querySelectorAll('.button, .search-container input, .search-container select, .dropbox, table, th, td');
    elements.forEach(el => el.classList.toggle('dark-mode', isDarkMode));
    console.log(`Dark mode set to: ${isDarkMode}`);
}

function applyFloatingArrows() {
    const floatingArrows = document.getElementById('floating-arrows');
    if (floatingArrows) {
        floatingArrows.style.display = BrawlStarsEditor.settings.showArrows ? 'flex' : 'none';
        console.log(`Floating arrows visibility set to: ${BrawlStarsEditor.settings.showArrows ? 'flex' : 'none'}`);
    }
}

// Placeholder functions for functionalities assumed to exist
function populateTable() {
    // Implement table population logic here
    console.log('populateTable called');
}

function initializeSettingsTabs() {
    // Implement settings tabs initialization here
    console.log('initializeSettingsTabs called');
}

function initializeDropbox() {
    // Implement Dropbox initialization here
    console.log('initializeDropbox called');
}

function toggleAutosave() {
    BrawlStarsEditor.settings.autosaveEnabled = document.getElementById('autosave-toggle').checked;
    console.log('Autosave toggled to:', BrawlStarsEditor.settings.autosaveEnabled);
    saveData();
}

function updateAutosaveInterval() {
    BrawlStarsEditor.settings.autosaveInterval = parseInt(document.getElementById('autosave-interval').value);
    console.log('Autosave interval updated to:', BrawlStarsEditor.settings.autosaveInterval);
    saveData();
}

function updateBackgroundColor() {
    BrawlStarsEditor.settings.backgroundColor = document.getElementById('background-color-picker').value;
    document.body.style.backgroundColor = BrawlStarsEditor.settings.backgroundColor;
    console.log('Background color updated to:', BrawlStarsEditor.settings.backgroundColor);
    saveData();
}

function updateTabColor() {
    BrawlStarsEditor.settings.tabColor = document.getElementById('tab-color-picker').value;
    document.querySelectorAll('th').forEach(th => {
        th.style.backgroundColor = BrawlStarsEditor.settings.tabColor;
    });
    console.log('Tab color updated to:', BrawlStarsEditor.settings.tabColor);
    saveData();
}

function toggleDarkMode() {
    BrawlStarsEditor.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
    applyDarkMode();
    console.log('Dark mode toggled to:', BrawlStarsEditor.settings.darkMode);
    saveData();
}

function toggleAnimations() {
    BrawlStarsEditor.settings.animationsEnabled = document.getElementById('animations-toggle').checked;
    console.log('Animations toggled to:', BrawlStarsEditor.settings.animationsEnabled);
    saveData();
}

function toggleFloatingArrows() {
    BrawlStarsEditor.settings.showArrows = document.getElementById('show-arrows-toggle').checked;
    applyFloatingArrows();
    console.log('Show arrows toggled to:', BrawlStarsEditor.settings.showArrows);
    saveData();
}

function toggleLowEndMode() {
    BrawlStarsEditor.settings.lowEndModeEnabled = document.getElementById('low-end-mode-toggle').checked;
    console.log('Low-End Mode toggled to:', BrawlStarsEditor.settings.lowEndModeEnabled);
    saveData();
}

function updateItemsPerPage() {
    BrawlStarsEditor.settings.itemsPerPage = parseInt(document.getElementById('items-per-page').value);
    console.log('Items per Page updated to:', BrawlStarsEditor.settings.itemsPerPage);
    populateTable();
    saveData();
}

function updateHistoryLimit() {
    BrawlStarsEditor.settings.historyLimit = parseInt(document.getElementById('history-limit').value);
    console.log('History Limit updated to:', BrawlStarsEditor.settings.historyLimit);
    saveData();
}

function toggleSettingsFloat() {
    BrawlStarsEditor.settings.settingsFloat = document.getElementById('settings-float-toggle').checked;
    console.log('Settings Float toggled to:', BrawlStarsEditor.settings.settingsFloat);
    saveData();
}

function toggleDragDrop() {
    BrawlStarsEditor.settings.dragDropEnabled = document.getElementById('drag-drop-toggle').checked;
    const dropbox = document.getElementById('dropbox');
    dropbox.style.display = BrawlStarsEditor.settings.dragDropEnabled ? 'block' : 'none';
    console.log('Drag and Drop toggled to:', BrawlStarsEditor.settings.dragDropEnabled);
    saveData();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        console.log('Entered fullscreen mode.');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            console.log('Exited fullscreen mode.');
        }
    }
    saveData();
}

function toggleFastFileDelete() {
    BrawlStarsEditor.settings.fastFileDeleteEnabled = document.getElementById('fast-file-delete-toggle').checked;
    console.log('Fast File Delete toggled to:', BrawlStarsEditor.settings.fastFileDeleteEnabled);
    saveData();
}

function toggleFastRowsDelete() {
    BrawlStarsEditor.settings.fastRowsDeleteEnabled = document.getElementById('fast-rows-delete-toggle').checked;
    console.log('Fast Rows Delete toggled to:', BrawlStarsEditor.settings.fastRowsDeleteEnabled);
    saveData();
}

function toggleFloatColumns() {
    BrawlStarsEditor.settings.floatColumnsEnabled = document.getElementById('float-columns-toggle').checked;
    console.log('Float Columns toggled to:', BrawlStarsEditor.settings.floatColumnsEnabled);
    saveData();
}

function toggleRowDragging() {
    BrawlStarsEditor.settings.enableRowDragging = document.getElementById('enable-row-dragging-toggle').checked;
    console.log('Row Dragging toggled to:', BrawlStarsEditor.settings.enableRowDragging);
    saveData();
}

function toggleMoreBullets() {
    BrawlStarsEditor.settings.enableMoreBullets = document.getElementById('enable-more-bullets-toggle').checked;
    console.log('More Bullets toggled to:', BrawlStarsEditor.settings.enableMoreBullets);
    saveData();
}

function toggleRowDeleting() {
    BrawlStarsEditor.settings.enableRowDeleting = document.getElementById('enable-row-deleting-toggle').checked;
    console.log('Row Deleting toggled to:', BrawlStarsEditor.settings.enableRowDeleting);
    saveData();
}
