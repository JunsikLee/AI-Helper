import { app, BrowserWindow, globalShortcut, Rectangle } from 'electron';
import Store from 'electron-store';

//import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

//const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

type StoreType = {
    windowsStatus: {
        x: number | undefined;
        y: number | undefined;
        width: number;
        height: number;
    };
    currentZoom: number;
};

const store = new Store<StoreType>({
    defaults: {
        windowsStatus: {
            x: undefined,
            y: undefined,
            width: 1200,
            height: 1200,
        },
        currentZoom: 1.0,
    },
});

function createWindow() {
    const windowsStatus = store.get('windowsStatus');
    win = new BrowserWindow({
        x: windowsStatus.x,
        y: windowsStatus.y,
        width: windowsStatus.width,
        height: windowsStatus.height,
        icon: path.join(process.env.VITE_PUBLIC, 'openai.svg'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
    });

    win.loadURL('https://chatgpt.com/');

    /*
    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString());
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'));
    }
    */

    const currentZoom = store.get('currentZoom');
    win.webContents.setZoomFactor(currentZoom);

    win.on('close', () => {
        const bounds: Rectangle | undefined = win?.getBounds();

        if (bounds) {
            store.set('windowsStatus', {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
            });
        }
    });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        win = null;
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(createWindow);

app.whenReady().then(() => {
    if (null === win) return;

    const webContents = win.webContents;

    globalShortcut.register('CommandOrControl+=', () => {
        const currentZoom = webContents.getZoomFactor();
        webContents.setZoomFactor(currentZoom + 0.1);
        store.get('currentZoom', currentZoom + 0.1);
    });

    globalShortcut.register('CommandOrControl+-', () => {
        const currentZoom = webContents.getZoomFactor();
        webContents.setZoomFactor(currentZoom - 0.1);
        store.get('currentZoom', currentZoom - 0.1);
    });

    globalShortcut.register('CommandOrControl+0', () => {
        webContents.setZoomFactor(1.0);
        store.get('currentZoom', 1.0);
    });
});

app.on('will-quit', () => {
    // 앱이 종료될 때 모든 글로벌 단축키를 해제
    globalShortcut.unregisterAll();
});
