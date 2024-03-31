import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "./PlayerContext";
import Lyrics from "./Lyrics";
import Progressbar from "./Progressbar";
import MusicControls from "./MusicControls";
import { SlPlaylist } from "react-icons/sl";
import { RiPlayListAddFill } from "react-icons/ri";

import noCoverImage from "../images/nocover.png";

export default function PlayerPage({ togglePlaylistShow }) {
    const { currentSong, isPlaying } = useContext(PlayerContext);
    const [lyricsShow, setLyricsShow] = useState(false);
    const [showSongDetail, setShowSongDetail] = useState(true);

    const toggleLyric = () => {
        setLyricsShow((prevShow) => !prevShow);
    };

    const toggleShowSongDetail = () => {
        setShowSongDetail((prevShow) => !prevShow);
    };

    useEffect(() => {
        document.title = `MP!Tree - ${currentSong?.artist} ${currentSong?.title}`;
    }, [currentSong]);

    return (
        <>
            <div className="playerContainer">
                <div className="cover-plus">
                    <div className="other-controls">
                        <span
                            className="other-button button"
                            onClick={togglePlaylistShow}
                        >
                            <RiPlayListAddFill
                                size={20}
                                className="button white react-icon"
                            />
                        </span>

                        <div
                            className="playerpage-songdetail button"
                            onClick={toggleShowSongDetail}
                            style={
                                showSongDetail ? { opacity: 1 } : { opacity: 0 }
                            }
                        >
                            <p className="playerpage-songname">
                                {currentSong?.title}
                            </p>
                            <p className="playerpage-artistname">
                                {currentSong?.artist}
                            </p>
                        </div>

                        <span
                            onClick={toggleLyric}
                            className="other-button button"
                        >
                            <SlPlaylist
                                size={20}
                                className="button white react-icon"
                            />
                        </span>
                    </div>
                    <div className="cover-continer">
                        <img
                            src={currentSong?.cover || noCoverImage}
                            alt="Cover"
                            className="cover-image"
                            id="cover-image"
                            style={
                                isPlaying
                                    ? { width: "300px", height: "300px" }
                                    : { width: "270px", height: "270px" }
                            }
                        />
                    </div>
                    <Lyrics
                        style={lyricsShow ? { opacity: 0.9 } : { opacity: 0 }}
                    />
                </div>
                <Progressbar />
                <MusicControls />
            </div>
        </>
    );
}
