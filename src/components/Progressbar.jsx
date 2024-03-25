import { useEffect, useState } from "react";
import * as player from "../player";

export default function Progressbar() {
    const [musicTime, setMusicTime] = useState(0);
    useEffect(() => {
        const handleTimeupdate = () => {
            setTimeout(() => {
                const currentTime = player.audio.currentTime;
                const musicDuration = player.audio.duration;
                const percent = (currentTime / musicDuration) * 100;
                setMusicTime(percent);
            }, 500);
        };
        const handleSrcCleared = () => {
            setMusicTime(0);
        };

        player.audio.addEventListener("timeupdate", handleTimeupdate);
        player.audio.addEventListener("srccleared", handleSrcCleared);

        return () => {
            player.audio.removeEventListener("timeupdate", handleTimeupdate);
            player.audio.removeEventListener("srccleared", handleSrcCleared);
        };
    }, []);

    const setSeek = (event) => {
        const rect = event.target.getBoundingClientRect();
        const percent = ((event.clientX - rect.left) / 270) * 100;
        const musicDuration = player.audio.duration;
        const current = (musicDuration / 100) * percent;
        player.seek(current);
    };
    return (
        <div className="progress-bar button" onClick={setSeek}>
            <div className="progress-bar-background">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${musicTime}%` }}
                ></div>
            </div>
        </div>
    );
}
