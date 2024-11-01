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

function toggleSettings(event) {
    event.stopPropagation();
    const settingsPopout = document.getElementById('settings-popout');
    if (settingsPopout) {
        settingsPopout.classList.toggle('show');
        console.log('Settings popout toggled to:', settingsPopout.classList.contains('show') ? 'shown' : 'hidden');
    }
}

document.addEventListener('click', function(event) {
    const settingsPopout = document.getElementById('settings-popout');
    const settingsButton = document.querySelector('.settings-button');
    
    if (settingsPopout && 
        settingsPopout.classList.contains('show') && 
        !settingsPopout.contains(event.target) && 
        !settingsButton.contains(event.target)) {
        settingsPopout.classList.remove('show');
    }
});

function toggleFullWidth() {
    const container = document.querySelector('.container');
    const tableContainer = document.querySelector('.table-container');
    const content = document.querySelector('.content');
    const fileList = document.querySelector('.file-list');
    
    if (!container) return;
    
    const isFullWidth = !container.classList.contains('full-width');
    
    // Toggle full width on all necessary containers
    container.classList.toggle('full-width');
    if (tableContainer) tableContainer.classList.toggle('full-width');
    if (content) content.classList.toggle('full-width');
    if (fileList) fileList.classList.toggle('full-width');
    
    BrawlStarsEditor.settings.fullWidthEnabled = isFullWidth;
    saveSettings();
    applySettings();
}

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const fullWidthToggle = document.getElementById('full-width-toggle');
    
    if (container && fullWidthToggle) {
        fullWidthToggle.checked = BrawlStarsEditor.settings.fullWidthEnabled;
        if (BrawlStarsEditor.settings.fullWidthEnabled) {
            container.classList.add('full-width');
        }
    }
});

function saveSettings() {
    const settings = {
        autosaveEnabled: document.getElementById('autosave-toggle').checked,
        autosaveInterval: parseInt(document.getElementById('autosave-interval').value),
        backgroundColor: document.getElementById('background-color-picker').value,
        tabColor: document.getElementById('tab-color-picker').value,
        darkMode: document.getElementById('dark-mode-toggle').checked,
        animationsEnabled: document.getElementById('animations-toggle').checked,
        showArrows: document.getElementById('show-arrows-toggle').checked,
        lowEndModeEnabled: document.getElementById('low-end-mode-toggle').checked,
        itemsPerPage: parseInt(document.getElementById('items-per-page').value),
        dragDropEnabled: document.getElementById('drag-drop-toggle').checked,
        fastFileDeleteEnabled: document.getElementById('fast-file-delete-toggle').checked,
        fastRowsDeleteEnabled: document.getElementById('fast-rows-delete-toggle').checked,
        floatColumnsEnabled: document.getElementById('float-columns-toggle').checked,
        enableRowDragging: document.getElementById('enable-row-dragging-toggle').checked,
        enableMoreBullets: document.getElementById('enable-more-bullets-toggle').checked,
        historyLimit: parseInt(document.getElementById('history-limit').value),
        fullWidthEnabled: document.getElementById('full-width-toggle').checked,
        settingsFloat: document.getElementById('settings-float-toggle').checked
    };

    Object.assign(BrawlStarsEditor.settings, settings);
    localStorage.setItem('editorSettings', JSON.stringify(BrawlStarsEditor.settings));
}

function loadSettings() {
    const savedSettings = localStorage.getItem('editorSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        Object.assign(BrawlStarsEditor.settings, settings);
        
        // Apply saved settings to UI elements
        document.getElementById('autosave-toggle').checked = settings.autosaveEnabled;
        document.getElementById('autosave-interval').value = settings.autosaveInterval;
        document.getElementById('background-color-picker').value = settings.backgroundColor;
        document.getElementById('tab-color-picker').value = settings.tabColor;
        document.getElementById('dark-mode-toggle').checked = settings.darkMode;
        document.getElementById('animations-toggle').checked = settings.animationsEnabled;
        document.getElementById('show-arrows-toggle').checked = settings.showArrows;
        document.getElementById('low-end-mode-toggle').checked = settings.lowEndModeEnabled;
        document.getElementById('items-per-page').value = settings.itemsPerPage;
        document.getElementById('drag-drop-toggle').checked = settings.dragDropEnabled;
        document.getElementById('fast-file-delete-toggle').checked = settings.fastFileDeleteEnabled;
        document.getElementById('fast-rows-delete-toggle').checked = settings.fastRowsDeleteEnabled;
        document.getElementById('float-columns-toggle').checked = settings.floatColumnsEnabled;
        document.getElementById('enable-row-dragging-toggle').checked = settings.enableRowDragging;
        document.getElementById('enable-more-bullets-toggle').checked = settings.enableMoreBullets;
        document.getElementById('history-limit').value = settings.historyLimit;
        document.getElementById('full-width-toggle').checked = settings.fullWidthEnabled;
        document.getElementById('settings-float-toggle').checked = settings.settingsFloat;
        
        // Apply settings effects
        document.body.style.backgroundColor = settings.backgroundColor;
        document.body.classList.toggle('dark-mode', settings.darkMode);
        document.documentElement.classList.toggle('dark-mode', settings.darkMode);
        document.querySelector('.container').classList.toggle('full-width', settings.fullWidthEnabled);
        document.getElementById('floating-arrows').style.display = settings.showArrows ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    addAutoSaveToInputs();
});

function addAutoSaveToInputs() {
    const inputs = document.querySelectorAll('.settings-content input, .settings-content select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            saveSettings();
            applySettings();
        });
    });
}

function applySettings() {
    const settings = BrawlStarsEditor.settings;
    const container = document.querySelector('.container');
    const tableContainer = document.querySelector('.table-container');
    const content = document.querySelector('.content');
    const fileList = document.querySelector('.file-list');
    
    // Apply full width settings to all containers
    if (container) container.classList.toggle('full-width', settings.fullWidthEnabled);
    if (tableContainer) tableContainer.classList.toggle('full-width', settings.fullWidthEnabled);
    if (content) content.classList.toggle('full-width', settings.fullWidthEnabled);
    if (fileList) fileList.classList.toggle('full-width', settings.fullWidthEnabled);
    
    // Apply other settings
    document.body.style.backgroundColor = settings.backgroundColor;
    document.body.classList.toggle('dark-mode', settings.darkMode);
    document.documentElement.classList.toggle('dark-mode', settings.darkMode);
    document.getElementById('floating-arrows').style.display = settings.showArrows ? 'flex' : 'none';
}

function closeSettings() {
    const settingsPopout = document.getElementById('settings-popout');
    if (settingsPopout) {
        settingsPopout.classList.remove('show');
        console.log('Settings popout closed.');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const settingsButton = document.querySelector('.settings-button');
    const settingsPopout = document.getElementById('settings-popout');

    if (settingsButton) {
        settingsButton.addEventListener('click', toggleSettings);
        console.log('Settings button click listener attached.');
    } else {
        console.error('Settings button not found.');
    }

    // Click outside to close settings
    document.addEventListener('click', function(event) {
        const isClickInside = settingsPopout.contains(event.target) || settingsButton.contains(event.target);
        if (settingsPopout.classList.contains('show') && !isClickInside) {
            settingsPopout.classList.remove('show');
            console.log('Settings popout closed by clicking outside.');
        }
    });

    // Prevent closing when clicking inside settings popout
    settingsPopout.addEventListener('click', function(event) {
        event.stopPropagation();
        console.log('Click inside settings popout detected.');
    });
});

// Update floating arrows functionality
function startScrolling(direction) {
    const container = document.querySelector('.container');
    const scrollAmount = 100;
    const scrollInterval = 50; // ms between scrolls

    function scroll() {
        switch (direction) {
            case 'up':
                container.scrollBy(0, -scrollAmount);
                break;
            case 'down':
                container.scrollBy(0, scrollAmount);
                break;
            case 'left':
                container.scrollBy(-scrollAmount, 0);
                break;
            case 'right':
                container.scrollBy(scrollAmount, 0);
                break;
        }
    }

    scroll(); // Initial scroll
    window.scrollInterval = setInterval(scroll, scrollInterval);
}

function stopScrolling() {
    if (window.scrollInterval) {
        clearInterval(window.scrollInterval);
    }
}
