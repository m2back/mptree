import { useEffect, useRef, useState } from "react";
import * as player from "../player";

export default function Lyrics({ style }) {
    const [lyrics, setLyrics] = useState(player.getLyrics());
    const [activeIndex, setActiveIndex] = useState(-1);
    const lyricsRef = useRef(null);

    useEffect(() => {
        player.audio.addEventListener("loadedmetadata", () => {
            setLyrics(player.getLyrics());
            const fiestLyricElement = lyricsRef.current.children[0];
            if (fiestLyricElement) {
                fiestLyricElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                });
            }
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
                            color: active ? "white" : "#fffd",
                            fontSize: active && "1.1em",
                            fontWeight: active && 800,
                            paddingTop: active && "7px",
                            paddingBottom: active && "7px",
                            marginLeft: active && "-0.1em",
                            marginRight: active && "-0.1em",
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
