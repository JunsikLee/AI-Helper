import React from 'react';
import ReactDOM from 'react-dom/client';
//import App from './App.tsx';
import './index.css';
import { HashRouter, Route, Routes } from 'react-router-dom';
//import App2 from './App2.tsx';
import SingleView from './view/SingleView.tsx';
import MutilView from './view/MutilView.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HashRouter>
            <Routes>
                <Route path="/" element={<SingleView />} />
                <Route path="/about" element={<MutilView />} />
            </Routes>
        </HashRouter>
    </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message);
});
