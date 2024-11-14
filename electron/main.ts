import { app, BrowserWindow, Rectangle, Menu } from 'electron';
import Store from 'electron-store';

//import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

//const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __lock = app.requestSingleInstanceLock();

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

app.setPath('userData', path.join(process.cwd(), 'cache'));

let win: BrowserWindow | null;

type StoreType = {
    windowsStatus: {
        x: number | undefined;
        y: number | undefined;
        width: number;
        height: number;
    };
    currentZoom: number;
    mode: number;
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
        mode: 1,
    },
});

function createWindow() {
    console.log(`🌳 캐시 저장 폴더 : ${path.join(process.cwd(), 'cache')}`);

    if (!__lock) {
        app.quit();
    } else {
        app.on('second-instance', () => {
            if (win) {
                if (win.isMinimized() || !win.isVisible()) {
                    win.show();
                }
                win.focus();
            }
        });
    }

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
            webviewTag: true,
            devTools: true,
        },
    });

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString());
    });

    const mode = store.get('mode');
    if (mode === 1) {
        if (VITE_DEV_SERVER_URL) {
            win && win.loadURL(VITE_DEV_SERVER_URL + '#/single');
        } else {
            // win.loadFile('dist/index.html')
            win && win.loadURL(`file://${path.join(RENDERER_DIST, 'index.html')}#/single`);
        }
    } else {
        if (VITE_DEV_SERVER_URL) {
            win && win.loadURL(VITE_DEV_SERVER_URL + '#/mutil');
        } else {
            // win.loadFile('dist/index.html')
            win && win.loadURL(`file://${path.join(RENDERER_DIST, 'index.html')}#/mutil`);
        }
    }

    /*
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'));
    }
        */

    const currentZoom = store.get('currentZoom', 1);
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
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Zoom Up',
                    accelerator: 'CommandOrControl+=',
                    click: () => {
                        const currentZoom = webContents.getZoomFactor();
                        webContents.setZoomFactor(currentZoom + 0.1);
                        store.get('currentZoom', currentZoom + 0.1);
                    },
                },
                {
                    label: 'Zoom Down',
                    accelerator: 'CommandOrControl+-',
                    click: () => {
                        const currentZoom = webContents.getZoomFactor();
                        webContents.setZoomFactor(currentZoom - 0.1);
                        store.set('currentZoom', currentZoom - 0.1);
                    },
                },
                {
                    label: 'Zoom Init',
                    accelerator: 'CommandOrControl+0',
                    click: () => {
                        webContents.setZoomFactor(1.0);
                        store.set('currentZoom', 1.0);
                    },
                },
                {
                    label: 'Single View',
                    accelerator: 'CommandOrControl+1',
                    click: () => {
                        if (VITE_DEV_SERVER_URL) {
                            win && win.loadURL(VITE_DEV_SERVER_URL + '#/single');
                        } else {
                            // win.loadFile('dist/index.html')
                            win && win.loadURL(`file://${path.join(RENDERER_DIST, 'index.html')}#/single`);
                        }
                        store.set('mode', 1);
                    },
                },
                {
                    label: 'Mutil View',
                    accelerator: 'CommandOrControl+2',
                    click: () => {
                        if (VITE_DEV_SERVER_URL) {
                            win && win.loadURL(VITE_DEV_SERVER_URL + '#/mutil');
                        } else {
                            // win.loadFile('dist/index.html')
                            win && win.loadURL(`file://${path.join(RENDERER_DIST, 'index.html')}#/mutil`);
                        }
                        store.set('mode', 2);
                    },
                },
                {
                    label: 'DEV',
                    accelerator: 'F12',
                    click: () => {
                        win && win.webContents.openDevTools();
                    },
                },
            ],
        },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
});
