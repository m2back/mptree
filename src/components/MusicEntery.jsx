import { useContext } from "react";
import { RiPlayListFill } from "react-icons/ri";
import { PlayerContext } from "./PlayerContext";
export default function MusicEntery({
    cover,
    id,
    title,
    artist,
    album,
    lyric,
}) {
    const { currentSong, playSongById } = useContext(PlayerContext);
    const active = currentSong.id === id;

    return (
        <>
            <div
                className="entry-container button"
                style={{
                    backgroundColor: active && "rgb(43, 43, 45)",
                    border: active
                        ? "solid #772b2b 1px"
                        : "solid transparent 1px",
                    transition: active && "all 0.2s ease-in-out 0s",
                }}
                onClick={() => {
                    playSongById(id);
                }}
            >
                <div className="entry-cover">
                    {lyric && (
                        <span className="entry-lyric">
                            <RiPlayListFill className="white" />
                        </span>
                    )}
                    <img
                        src={cover}
                        alt="Mini Cover"
                        className="entry-cover-image"
                    />
                </div>
                <div className="entry-details">
                    <span className="entry-title">{title}</span>
                    <br />
                    <span className="entry-artist">{artist}</span>
                    <span> • </span>
                    <span className="entry-album">{album}</span>
                </div>
            </div>
        </>
    );
}
