function saveData() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        localStorage.setItem('editorData', JSON.stringify({
            data: BrawlStarsEditor.data,
            currentFileName: BrawlStarsEditor.currentFileName,
            loadedFiles: BrawlStarsEditor.loadedFiles,
            settings: BrawlStarsEditor.settings
        }));
        console.log('Data saved successfully.');
    }
}

function autosave() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        saveData();
        setTimeout(autosave, BrawlStarsEditor.settings.autosaveInterval);
        console.log(`Autosave scheduled every ${BrawlStarsEditor.settings.autosaveInterval} ms.`);
    }
}

function processAIChat() {
    const aiChatInput = document.getElementById('ai-chat').value;
    console.log('Processing AI chat:', aiChatInput);
    // Implement AI chat processing logic here
}

let scrollInterval;

function startScrolling(direction) {
    console.log(`startScrolling called with direction: ${direction}`);
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found for scrolling.');
        return;
    }

    scrollInterval = setInterval(() => {
        switch (direction) {
            case 'up':
                container.scrollBy({ top: -10, behavior: 'auto' });
                break;
            case 'down':
                container.scrollBy({ top: 10, behavior: 'auto' });
                break;
            case 'left':
                container.scrollBy({ left: -10, behavior: 'auto' });
                break;
            case 'right':
                container.scrollBy({ left: 10, behavior: 'auto' });
                break;
            default:
                console.warn(`Unknown scrolling direction: ${direction}`);
        }
    }, 50);
}

function stopScrolling() {
    console.log('stopScrolling called');
    clearInterval(scrollInterval);
}
