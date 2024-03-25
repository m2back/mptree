import { useEffect, useState } from "react";
import * as player from "../player";
import Lyrics from "./Lyrics";
import Progressbar from "./Progressbar";
import MusicControls from "./MusicControls";
import { SlPlaylist } from "react-icons/sl";
import { RiPlayListAddFill } from "react-icons/ri";
import noCoverImage from "../images/nocover.jpg";

export default function PlayerPage({ togglePlaylistShow }) {
    const [lyricsShow, setLyricsShow] = useState(false);
    const [cover, setCover] = useState(player.getCover());
    const [showSongDetail, setShowSongDetail] = useState(true);
    const [songName, setSongName] = useState(player.getSongName());
    const [artistName, setArtistName] = useState(player.getArtistName());
    const [isPlaying, setIsPlaying] = useState(true);

    const toggleLyric = () => {
        setLyricsShow((prevShow) => !prevShow);
    };

    const toggleShowSongDetail = () => {
        setShowSongDetail((prevShow) => !prevShow);
    };

    useEffect(() => {
        player.audio.addEventListener("loadedmetadata", () => {
            setCover(player.getCover());
            setSongName(player.getSongName());
            setArtistName(player.getArtistName());
            document.title = `MP!Tree - ${artistName} ${songName}`;
        });
        player.audio.addEventListener("srccleared", () => {
            setCover(noCoverImage);
            setSongName(player.getSongName());
            setArtistName(player.getArtistName());
        });
        player.audio.addEventListener("play", () => {
            setIsPlaying(true);
        });
        player.audio.addEventListener("pause", () => {
            setIsPlaying(false);
        });
    }, []);

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
                            <p className="playerpage-songname">{songName}</p>
                            <p className="playerpage-artistname">
                                {artistName}
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
                            src={cover}
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
