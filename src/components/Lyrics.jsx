import { useContext, useEffect, useRef } from "react";
import { PlayerContext } from "./PlayerContext";

export default function Lyrics({ style }) {
    const { currentSong, setTime, play, activeLyricIndex } =
        useContext(PlayerContext);
    const lyricsRef = useRef(null);

    useEffect(() => {
        const firstLyricElement = lyricsRef.current.children[0];
        if (firstLyricElement) {
            firstLyricElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
        }
    }, [currentSong?.lyric]);

    useEffect(() => {
        const activeLyricElement = lyricsRef.current.children[activeLyricIndex];
        if (activeLyricElement) {
            activeLyricElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest",
            });
        }
    }, [activeLyricIndex]);

    const lyricsElement = () => {
        if (currentSong?.lyric) {
            return currentSong.lyric.map((lyric, index) => {
                const active = index === activeLyricIndex;
                return (
                    <p
                        onClick={() => {
                            setTime(lyric.start);
                            play();
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
