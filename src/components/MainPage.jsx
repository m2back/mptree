import { useState } from "react";
import "../styles/style.css";
import PlayerPage from "./PlayerPage";
import Playlist from "./Playlist";
import SelectPage from "./SelectPage";

const MainPage = () => {
    const [showPlayer, setShowPlayer] = useState(false);
    const [playlistShow, setPlaylistShow] = useState(false);

    const toggleShowPlayer = () => {
        setShowPlayer((prevShow) => !prevShow);
    };

    const togglePlaylistShow = () => {
        setPlaylistShow((isVisible) => !isVisible);
    };

    return (
        <>
            {!showPlayer && <SelectPage toggleShowPlayer={toggleShowPlayer} />}
            {showPlayer && (
                <div className="main-window">
                    <div className="main-left-container">
                        {playlistShow && (
                            <Playlist togglePlaylistShow={togglePlaylistShow} />
                        )}
                    </div>
                    <div className="main-center-container">
                        <PlayerPage togglePlaylistShow={togglePlaylistShow} />
                    </div>
                    <div className="main-right-container"></div>
                </div>
            )}
        </>
    );
};

export default MainPage;
