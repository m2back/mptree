import { useEffect, useState } from "react";
import * as player from "../player";
import "../styles/style.css";
import PlayerPage from "./PlayerPage";
import Playlist from "./Playlist";
import SelectPage from "./SelectPage";

const MainPage = () => {
    const [showPlayer, setShowPlayer] = useState(false);
    const [playlistShow, setPlaylistShow] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState(player.getCover());

    const toggleShowPlayer = () => {
        setShowPlayer((prevShow) => !prevShow);
    };

    const togglePlaylistShow = () => {
        setPlaylistShow((isVisible) => !isVisible);
    };

    useEffect(() => {
        const handleMetadata = () => {
            setBackgroundImage(player.getCover());
        };
        player.audio.addEventListener("loadedmetadata", handleMetadata);
        return () => {
            player.audio.removeEventListener("loadedmetadata", handleMetadata);
        };
    }, []);

    return (
        <>
            {!showPlayer && <SelectPage toggleShowPlayer={toggleShowPlayer} />}
            {showPlayer && (
                <>
                    <div
                        className="background-image"
                        style={
                            backgroundImage && {
                                backgroundImage: `url(${backgroundImage})`,
                            }
                        }
                    >
                        <div className="background-top-color"></div>
                    </div>
                    <div className="main-window">
                        <div className="main-left-container">
                            {playlistShow && (
                                <Playlist
                                    togglePlaylistShow={togglePlaylistShow}
                                />
                            )}
                        </div>
                        <div className="main-center-container">
                            <PlayerPage
                                togglePlaylistShow={togglePlaylistShow}
                            />
                        </div>
                        <div className="main-right-container"></div>
                    </div>
                </>
            )}
        </>
    );
};

export default MainPage;
