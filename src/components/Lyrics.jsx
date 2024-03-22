import { useEffect, useRef, useState } from "react";
import * as player from "./Player";

export default function Lyrics() {
    const [lyrics, setLyrics] = useState(player.getLyrics());
    const [activeIndex, setActiveIndex] = useState(-1);
    const lyricsRef = useRef(null);

    player.audio.addEventListener("loadedmetadata", () => {
        setLyrics(player.getLyrics());
    });

    player.audio.addEventListener("srccleared", () => {
        setLyrics(null);
    });

    player.audio.addEventListener("timeupdate", () => {
        const currentTime = player.audio.currentTime;
        if (lyrics) {
            const foundIndex = lyrics.findIndex((lyric) => {
                if (lyric.start <= currentTime && lyric.end >= currentTime) {
                    return true;
                }
            });
            setActiveIndex(foundIndex);
        }
    });

    useEffect(() => {
        const activeLyricElement = lyricsRef.current.children[activeIndex - 3];
        if (activeLyricElement) {
            activeLyricElement.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [activeIndex]);

    const lyricsElement = () => {
        if (lyrics) {
            return lyrics.map((lyric, index) => {
                const active = index === activeIndex;
                return (
                    <p
                        onClick={() => {
                            player.audio.currentTime = lyric.start;
                            player.play();
                        }}
                        key={index}
                        className="lyric-p button"
                        style={{
                            color: active ? "#5cceae" : "wheat",
                            fontSize: active && "1.3em",
                            paddingTop: active && "7px",
                            paddingBottom: active && "7px",
                        }}
                    >
                        {lyric.text}
                    </p>
                );
            });
        } else {
            return <p className="lyric-p">No Lyrics Found</p>;
        }
    };
    return (
        <>
            <div className="lyrics-page" ref={lyricsRef}>
                {lyricsElement()}
            </div>
        </>
    );
}
