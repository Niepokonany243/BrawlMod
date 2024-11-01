window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
    return false;
};

window.BrawlStarsEditor = {
    data: {},
    currentFileName: '',
    loadedFiles: [],
    undoStack: [],
    redoStack: [],
    originalData: {},
    projectileData: {
    },
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
        enableRowDeleting: false
    },
    deleteModeEnabled: false
};

function applySettings() {
    applyDarkMode();
    toggleFloatingArrows();
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
        } else {
            console.warn(`Element with id "${element.id}" not found.`);
        }
    });
}

function loadSavedData() {
    const loadingContainer = document.getElementById('loading-container');
    const loadingProgress = loadingContainer.querySelector('.loading-progress');
    const loadingText = loadingContainer.querySelector('.loading-text');
    
    loadingContainer.style.display = 'block';
    loadingText.textContent = 'Loading saved data...';

    return new Promise((resolve) => {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            loadingProgress.style.width = `${progress}%`;
            
            if (progress >= 90) {
                clearInterval(progressInterval);
                
                const savedData = JSON.parse(localStorage.getItem('editorData') || '{}');
                if (Object.keys(savedData).length > 0) {
                    BrawlStarsEditor.data = savedData.data || {};
                    BrawlStarsEditor.currentFileName = savedData.currentFileName || '';
                    BrawlStarsEditor.loadedFiles = savedData.loadedFiles || [];
                    BrawlStarsEditor.settings = {...BrawlStarsEditor.settings, ...savedData.settings};
                    
                    loadingProgress.style.width = '100%';
                    
                    setTimeout(() => {
                        loadingContainer.style.display = 'none';
                        updateSettings(BrawlStarsEditor.settings);
                        updateFileButtons();
                        populateTable();
                        applySettings();
                        resolve();
                    }, 200);
                } else {
                    loadingContainer.style.display = 'none';
                    resolve();
                }
            }
        }, 50);
    });
}

function updateSettings(settings) {
    document.body.style.backgroundColor = settings.backgroundColor;
    document.getElementById('background-color-picker').value = settings.backgroundColor;
    document.getElementById('tab-color-picker').value = settings.tabColor;
    document.getElementById('autosave-toggle').checked = settings.autosaveEnabled;
    document.getElementById('autosave-interval').value = settings.autosaveInterval;
    document.getElementById('animations-toggle').checked = settings.animationsEnabled;
    document.getElementById('low-end-mode-toggle').checked = settings.lowEndModeEnabled;
    document.getElementById('items-per-page').value = settings.itemsPerPage;
    document.getElementById('drag-drop-toggle').checked = settings.dragDropEnabled;
    document.getElementById('fast-file-delete-toggle').checked = settings.fastFileDeleteEnabled;
    document.getElementById('fast-rows-delete-toggle').checked = settings.fastRowsDeleteEnabled;
    document.getElementById('float-columns-toggle').checked = settings.floatColumnsEnabled;
    document.getElementById('enable-row-dragging-toggle').checked = settings.enableRowDragging;
    document.getElementById('history-limit').value = settings.historyLimit;
    document.getElementById('enable-more-bullets-toggle').checked = settings.enableMoreBullets;
    document.getElementById('dark-mode-toggle').checked = settings.darkMode;
}

function applyDarkMode() {
    const isDarkMode = BrawlStarsEditor.settings.darkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#121212' : '#f2f2f2';
    const elements = document.querySelectorAll('.button, .search-container input, .search-container select, .dropbox, table, th, td');
    elements.forEach(el => el.classList.toggle('dark-mode', isDarkMode));
}

function updateFileButtons() {
    const fileButtons = document.getElementById('file-buttons');
    fileButtons.innerHTML = `
        <div class="trash-bin" id="trash-bin" onclick="toggleDeleteMode()">🗑️</div>
        <div class="file-list"></div>
    `;
    const fileList = fileButtons.querySelector('.file-list');
    BrawlStarsEditor.loadedFiles.forEach(fileName => addFileButtons(fileName, fileList));
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

function toggleDarkMode() {
    BrawlStarsEditor.settings.darkMode = document.getElementById('dark-mode-toggle').checked;
    applyDarkMode();
    saveData();
}

function toggleRowDeleting() {
    BrawlStarsEditor.settings.enableRowDeleting = document.getElementById('enable-row-deleting-toggle').checked;
    saveData();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSearchTable = debounce(searchTable, 300);

function searchTable() {
}

document.getElementById('search').addEventListener('input', debouncedSearchTable);

function populateTable() {
    const tableBody = document.getElementById('table-body');
    const tableHeader = document.getElementById('table-header');
    const searchOptions = document.getElementById('search-options');
    tableBody.innerHTML = '';
    tableHeader.innerHTML = '';
    searchOptions.innerHTML = '<option value="all">All</option>';
    if (!BrawlStarsEditor.data[BrawlStarsEditor.currentFileName]) return;
    const headers = BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][0];
    const fragment = document.createDocumentFragment();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        fragment.appendChild(th);
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        searchOptions.appendChild(option);
    });
    tableHeader.appendChild(fragment);
    const rowFragment = document.createDocumentFragment();
    BrawlStarsEditor.data[BrawlStarsEditor.currentFileName].slice(1).forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = cell;
            input.dataset.row = rowIndex + 1;
            input.dataset.col = cellIndex;
            input.addEventListener('change', handleCellChange);
            td.appendChild(input);
            tr.appendChild(td);
        });
        rowFragment.appendChild(tr);
    });
    tableBody.appendChild(rowFragment);
}

function toggleFloatingArrows() {
    const floatingArrows = document.getElementById('floating-arrows');
    const showArrows = document.getElementById('show-arrows-toggle').checked;
    floatingArrows.style.display = showArrows ? 'flex' : 'none';
    BrawlStarsEditor.settings.showArrows = showArrows;
    saveData();
}

function initializeSettingsTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function toggleFullscreen() {
    const isFullscreen = document.getElementById('fullscreen-toggle').checked;
    if (isFullscreen) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
    saveData();
}
