function saveData() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        localStorage.setItem('editorData', JSON.stringify({
            data: BrawlStarsEditor.data,
            currentFileName: BrawlStarsEditor.currentFileName,
            loadedFiles: BrawlStarsEditor.loadedFiles,
            settings: BrawlStarsEditor.settings
        }));
    }
}

function autosave() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        saveData();
        setTimeout(autosave, BrawlStarsEditor.settings.autosaveInterval);
    }
}

function processAIChat() {
    const aiChatInput = document.getElementById('ai-chat').value;
    console.log('Processing AI chat:', aiChatInput);
}

function startScrolling(direction) {
    const container = document.querySelector('.container');
    switch (direction) {
        case 'up':
            container.scrollBy({ top: -100, behavior: 'smooth' });
            break;
        case 'down':
            container.scrollBy({ top: 100, behavior: 'smooth' });
            break;
        case 'left':
            container.scrollBy({ left: -100, behavior: 'smooth' });
            break;
        case 'right':
            container.scrollBy({ left: 100, behavior: 'smooth' });
            break;
    }
}

function stopScrolling() {
}
