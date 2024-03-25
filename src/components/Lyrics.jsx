import { useEffect, useRef, useState } from "react";
import * as player from "../player";

export default function Lyrics({ style }) {
    const [lyrics, setLyrics] = useState(player.getLyrics());
    const [activeIndex, setActiveIndex] = useState(-1);
    const lyricsRef = useRef(null);

    useEffect(() => {
        player.audio.addEventListener("loadedmetadata", () => {
            setLyrics(player.getLyrics());
        });

        player.audio.addEventListener("srccleared", () => {
            setLyrics(null);
        });
    }, []);

    useEffect(() => {
        player.audio.addEventListener("timeupdate", () => {
            const currentTime = player.audio.currentTime;
            if (lyrics) {
                const foundIndex = lyrics.findIndex((lyric) => {
                    if (
                        lyric.start <= currentTime &&
                        lyric.end >= currentTime
                    ) {
                        return true;
                    }
                });
                setActiveIndex(foundIndex);
            }
        });
        console.log("UseEffect is running");
    }, [lyrics]);

    useEffect(() => {
        const activeLyricElement = lyricsRef.current.children[activeIndex];
        if (activeLyricElement) {
            activeLyricElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
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
            <div className="lyrics-page" ref={lyricsRef} style={style}>
                {lyricsElement()}
            </div>
        </>
    );
}
