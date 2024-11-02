function saveState() {
    if (BrawlStarsEditor.undoStack.length >= BrawlStarsEditor.settings.historyLimit) {
        BrawlStarsEditor.undoStack.shift();
    }
    
    const currentState = {
        type: 'text',
        changes: collectTextChanges(),
        timestamp: Date.now()
    };
    
    BrawlStarsEditor.undoStack.push(currentState);
    BrawlStarsEditor.redoStack = [];
    
    updateUndoRedoButtons();
    saveData();
}

function collectTextChanges() {
    const changes = [];
    const table = document.getElementById('table-body');
    if (!table) return changes;
    
    table.querySelectorAll('td').forEach(cell => {
        const input = cell.querySelector('input, select');
        if (input && input.value !== input.defaultValue) {
            changes.push({
                row: cell.parentElement.dataset.row,
                col: cell.dataset.col,
                value: input.value,
                oldValue: input.defaultValue
            });
        }
    });
    
    return changes;
}

function undo() {
    if (BrawlStarsEditor.undoStack.length > 1) {
        const currentState = BrawlStarsEditor.undoStack.pop();
        BrawlStarsEditor.redoStack.push(currentState);
        
        if (currentState.type === 'text') {
            applyTextChanges(currentState.changes, true);
        } else {
            const previousState = BrawlStarsEditor.undoStack[BrawlStarsEditor.undoStack.length - 1];
            BrawlStarsEditor.data = JSON.parse(JSON.stringify(previousState.data));
            BrawlStarsEditor.currentFileName = previousState.currentFileName;
            populateTable();
        }
        
        updateUndoRedoButtons();
        saveData();
    }
}

function redo() {
    if (BrawlStarsEditor.redoStack.length > 0) {
        const nextState = BrawlStarsEditor.redoStack.pop();
        BrawlStarsEditor.undoStack.push(nextState);
        
        if (nextState.type === 'text') {
            applyTextChanges(nextState.changes, false);
        } else {
            BrawlStarsEditor.data = JSON.parse(JSON.stringify(nextState.data));
            BrawlStarsEditor.currentFileName = nextState.currentFileName;
            populateTable();
        }
        
        updateUndoRedoButtons();
        saveData();
    }
}

function applyTextChanges(changes, isUndo) {
    const table = document.getElementById('table-body');
    if (!table) return;
    
    changes.forEach(change => {
        const cell = table.querySelector(`tr[data-row="${change.row}"] td[data-col="${change.col}"]`);
        if (cell) {
            const input = cell.querySelector('input, select');
            if (input) {
                if (isUndo) {
                    input.value = change.oldValue;
                    input.defaultValue = change.oldValue;
                    updateDataFromInput(input, change.row, change.col);
                } else {
                    input.value = change.value;
                    input.defaultValue = change.value;
                    updateDataFromInput(input, change.row, change.col);
                }
            }
        }
    });
}

function updateDataFromInput(input, row, col) {
    if (BrawlStarsEditor.data[BrawlStarsEditor.currentFileName]) {
        BrawlStarsEditor.data[BrawlStarsEditor.currentFileName][row][col] = input.value;
    }
}

function updateUndoRedoButtons() {
    const undoButton = document.querySelector('button[onclick="undo()"]');
    const redoButton = document.querySelector('button[onclick="redo()"]');
    
    if (undoButton) {
        undoButton.disabled = BrawlStarsEditor.undoStack.length <= 1;
        undoButton.style.opacity = BrawlStarsEditor.undoStack.length <= 1 ? '0.5' : '1';
    }
    
    if (redoButton) {
        redoButton.disabled = BrawlStarsEditor.redoStack.length === 0;
        redoButton.style.opacity = BrawlStarsEditor.redoStack.length === 0 ? '0.5' : '1';
    }
}

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
            event.preventDefault();
            if (event.shiftKey) {
                redo();
            } else {
                undo();
            }
        } else if (event.key === 'y') {
            event.preventDefault();
            redo();
        }
    }
});

function saveData() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        localStorage.setItem('editorData', JSON.stringify({
            data: BrawlStarsEditor.data,
            currentFileName: BrawlStarsEditor.currentFileName,
            loadedFiles: BrawlStarsEditor.loadedFiles,
            settings: BrawlStarsEditor.settings,
            undoStack: BrawlStarsEditor.undoStack,
            redoStack: BrawlStarsEditor.redoStack
        }));
    }
}

function autosave() {
    if (BrawlStarsEditor.settings.autosaveEnabled) {
        saveData();
        setTimeout(autosave, BrawlStarsEditor.settings.autosaveInterval);
    }
}

let scrollInterval;

function startScrolling(direction) {
    const container = document.querySelector('.container');
    if (!container) {
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
        }
    }, 50);
}

function stopScrolling() {
    clearInterval(scrollInterval);
}
