const { app, BrowserWindow, Menu } = require('electron');

async function createWindow() {
	const Store = (await import('electron-store')).default;
	const store = new Store();

    const lastWindowState = store.get('windowState', {
        width: 1200,
        height: 1200,
        x: undefined,
        y: undefined,
    });

    const win = new BrowserWindow({
        width: lastWindowState.width,
        height: lastWindowState.height,
        x: lastWindowState.x,
        y: lastWindowState.y,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    //win.loadFile('index.html');
    win.loadURL('https://chatgpt.com/');

    Menu.setApplicationMenu(null);
	
    win.on('close', () => {
        const bounds = win.getBounds(); 
        store.set('windowState', {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
        });
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
