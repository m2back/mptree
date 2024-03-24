import React from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./components/MainPage.jsx";
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
import * as process from "process";
globalThis.process = process;

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <MainPage />
    </React.StrictMode>
);
