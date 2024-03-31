import Menu from "./Menu/Index";
import { useContext, useState } from "react";
import { RiPlayListFill } from "react-icons/ri";
import { PlayerContext } from "./PlayerContext";
import { TfiMoreAlt } from "react-icons/tfi";
import { FaPlay, FaPause } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import * as playerOptions from "../playerOptions";

export default function MusicEntery({
    cover,
    id,
    title,
    artist,
    album,
    lyric,
    format,
    address,
    name,
}) {
    const [isMouseIn, setIsMouseIn] = useState(false);
    const favlist = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
    const [isFave, setIsFave] = useState(favlist.includes(id));
    const {
        currentSong,
        playSongById,
        togglePlayPause,
        isPlaying,
        removeSongById,
    } = useContext(PlayerContext);

    const active = currentSong.id === id;

    const handleMouseEnter = () => {
        setIsMouseIn(true);
    };

    const handleMouseLeave = () => {
        setIsMouseIn(false);
    };

    const hostURL = "http://localhost:3000";

    const addToFavHandler = () => {
        const favlist = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
        const index = favlist.indexOf(id);
        if (index > -1) {
            favlist.splice(index, 1);
        } else {
            favlist.push(id);
        }
        setIsFave((prevFav) => !prevFav);
        localStorage.setItem("favoriteSongs", JSON.stringify(favlist));
    };

    const formatElemets = ["mp3", "m4a", "flac", "ogg"].map((item) => {
        if (item !== format) {
            return (
                <Menu.Item
                    key={item}
                    className="entry-menu-item"
                    onClick={() => {
                        playerOptions.convertTo(address, name, item, hostURL);
                    }}
                >
                    {item.toUpperCase()}
                </Menu.Item>
            );
        }
    });

    return (
        <>
            <div
                className="entry-container"
                onMouseOver={handleMouseEnter}
                onMouseOut={handleMouseLeave}
                style={{
                    backgroundColor: active && "rgb(43, 43, 45)",
                    border: active
                        ? "solid #772b2b 1px"
                        : "solid transparent 1px",
                    transition: active && "all 0.2s ease-in-out 0s",
                }}
            >
                <div className="entry-cover">
                    {isFave && (
                        <div className="entry-favbox">
                            <FaStar className="entry-favbox-star" size={15} />
                        </div>
                    )}
                    {lyric && (
                        <span className="entry-lyric">
                            <RiPlayListFill className="white" />
                        </span>
                    )}

                    {!active && (
                        <div
                            onClick={() => {
                                playSongById(id);
                            }}
                            style={{ opacity: isMouseIn ? 1 : 0 }}
                            className="entry-playpauseicon button"
                        >
                            <FaPlay size={25} />
                        </div>
                    )}
                    {active && !isPlaying && (
                        <div
                            onClick={togglePlayPause}
                            style={{ opacity: isMouseIn ? 1 : 0 }}
                            className="entry-playpauseicon button"
                        >
                            <FaPlay size={25} />
                        </div>
                    )}
                    {active && isPlaying && (
                        <div
                            onClick={togglePlayPause}
                            style={{ opacity: isMouseIn ? 1 : 0 }}
                            className="entry-playpauseicon button"
                        >
                            <FaPause size={25} />
                        </div>
                    )}
                    <img
                        src={cover}
                        alt="Mini Cover"
                        className="entry-cover-image"
                    />
                </div>
                <div
                    className="entry-details button"
                    onClick={() => {
                        playSongById(id);
                    }}
                >
                    <span
                        className="entry-title"
                        style={{ color: isFave && "gold" }}
                    >
                        {title}
                    </span>
                    <br />
                    <span className="entry-artist">{artist}</span>
                    <span> • </span>
                    <span className="entry-album">{album}</span>
                </div>
                <Menu className="entry-menu">
                    <Menu.Button
                        className="entry-menu-button"
                        style={{ opacity: isMouseIn ? 1 : 0 }}
                    >
                        <TfiMoreAlt />
                    </Menu.Button>
                    <Menu.Dropdown className="entry-menu-dropdown">
                        <Menu.Item
                            className="entry-menu-item"
                            onClick={addToFavHandler}
                            style={{ color: "gold" }}
                        >
                            {isFave
                                ? "Remove from Favorites"
                                : "Add to Favorites"}
                        </Menu.Item>
                        <Menu.Item
                            className="entry-menu-item"
                            style={{ color: "red" }}
                            onClick={() => {
                                removeSongById(id);
                            }}
                        >
                            Remove
                        </Menu.Item>
                        <Menu.Sub
                            dropdownClassName="entry-menu-dropdown"
                            className="entry-menu-item"
                            value="Convert to ..."
                            prompt="Select Format"
                        >
                            {formatElemets}
                        </Menu.Sub>
                    </Menu.Dropdown>
                </Menu>
            </div>
        </>
    );
}
