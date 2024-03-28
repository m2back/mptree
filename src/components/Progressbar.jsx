import { useContext } from "react";
import { PlayerContext } from "./PlayerContext";
export default function Progressbar() {
    const { seek, duration, currentTimePercent } = useContext(PlayerContext);
    const setSeek = (event) => {
        const rect = event.target.getBoundingClientRect();
        const percent = ((event.clientX - rect.left) / 270) * 100;
        const current = (duration / 100) * percent;
        seek(current);
    };

    return (
        <div className="progress-bar button" onClick={setSeek}>
            <div className="progress-bar-background">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${currentTimePercent}%` }}
                ></div>
            </div>
        </div>
    );
}
