import { useEffect, useState } from "react";
import * as player from "../player";
import Lyrics from "./Lyrics";
import Progressbar from "./Progressbar";

export default function PlayerPage({ togglePlaylistShow }) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [lyricsShow, setLyricsShow] = useState(false);
    const [shuffle, setShuffle] = useState(player.getShuffle());
    const [repeat, setRepeat] = useState(player.getRepeat());
    const [cover, setCover] = useState(player.getCover());
    const [showSongDetail, setShowSongDetail] = useState(true);
    const [songName, setSongName] = useState(player.getSongName());
    const [artistName, setArtistName] = useState(player.getArtistName());

    const toggleLyric = () => {
        setLyricsShow((prevShow) => !prevShow);
    };

    const toggleShowSongDetail = () => {
        setShowSongDetail((prevShow) => !prevShow);
    };

    useEffect(() => {
        player.audio.addEventListener("play", () => {
            setIsPlaying(true);
        });
        player.audio.addEventListener("pause", () => {
            setIsPlaying(false);
        });
        player.audio.addEventListener("loadedmetadata", () => {
            setCover(player.getCover());
            setSongName(player.getSongName());
            setArtistName(player.getArtistName());
            setRepeat(player.getRepeat());
            document.title = `MP!Tree - ${artistName} ${songName}`;
        });
        player.audio.addEventListener("srccleared", () => {
            setCover("images/coversample.jpg");
            setIsPlaying(false);
            setSongName(player.getSongName());
            setArtistName(player.getArtistName());
        });
    }, []);

    const togglePlayPause = () => {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
    };

    return (
        <>
            <div className="playerContainer">
                <div className="cover-plus">
                    <div className="other-controls">
                        <img
                            src="./images/playlist.png"
                            alt="Playlist"
                            className="other-button button"
                            onClick={togglePlaylistShow}
                        />

                        <div
                            className="playerpage-songdetail button"
                            onClick={toggleShowSongDetail}
                        >
                            {showSongDetail && (
                                <>
                                    <p className="playerpage-songname">
                                        {songName}
                                    </p>
                                    <p className="playerpage-artistname">
                                        {artistName}
                                    </p>
                                </>
                            )}
                        </div>

                        <img
                            onClick={toggleLyric}
                            src="./images/lyrics.png"
                            alt="Lyrics"
                            className="other-button button"
                        />
                    </div>
                    <div className="cover-continer">
                        <img
                            src={cover}
                            alt="Cover"
                            className="cover-image"
                            id="cover-image"
                        />
                    </div>
                    {lyricsShow && <Lyrics />}
                </div>
                <Progressbar />
                <div className="music-controls">
                    <img
                        src={
                            shuffle == "off"
                                ? "images/shuffleDisable.png"
                                : shuffle == "normal"
                                ? "/images/shuffle.png"
                                : shuffle == "smart"
                                ? "/images/shuffleSmart.png"
                                : ""
                        }
                        alt="Shuffle"
                        className="control-button button"
                        onClick={() => {
                            player.toggleShuffle();
                            setShuffle(player.getShuffle());
                        }}
                    />
                    <img
                        src="./images/prev.png"
                        alt="Previus"
                        className="control-button button"
                        onClick={player.prev}
                    />
                    <img
                        src={
                            isPlaying
                                ? "./images/pause.png"
                                : "./images/play.png"
                        }
                        alt="Play"
                        className="control-button button"
                        onClick={togglePlayPause}
                    />
                    <img
                        src="./images/next.png"
                        alt="Next"
                        className="control-button button"
                        onClick={player.next}
                    />
                    <img
                        src={
                            repeat == "off"
                                ? "images/repeatDisable.png"
                                : repeat == "all"
                                ? "images/repeat.png"
                                : repeat == "single"
                                ? "images/repeatSingle.png"
                                : ""
                        }
                        alt="Repeat"
                        className="control-button button"
                        onClick={() => {
                            player.toggleRepeat();
                            setRepeat(player.getRepeat());
                        }}
                    />
                </div>
            </div>
        </>
    );
}
