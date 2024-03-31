import React from "react";
import ReactDOM from "react-dom/client";
import MainPage from "./components/MainPage";
import PlayerContext from "./components/PlayerContext";
import { Toaster } from "react-hot-toast";
import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
import * as process from "process";
globalThis.process = process;

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <PlayerContext>
            <Toaster
                position="bottom-right"
                reverseOrder={true}
                toastOptions={{
                    // Define default options
                    className: "",
                    duration: 5000,
                    style: {
                        background: "rgb(19, 19, 19)",
                        color: "#fff",
                        minWidth: 400,
                        width: "fit-content",
                    },
                }}
            />
            <MainPage />
        </PlayerContext>
    </React.StrictMode>
);
