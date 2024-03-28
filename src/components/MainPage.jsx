import { useContext, useState } from "react";
import "../styles/style.css";
import PlayerPage from "./PlayerPage";
import Playlist from "./Playlist";
import SelectPage from "./SelectPage";
import { PlayerContext } from "./PlayerContext";

const MainPage = () => {
    const { currentSong } = useContext(PlayerContext);
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
                <>
                    <div
                        className="background-image"
                        style={
                            currentSong?.cover && {
                                backgroundImage: `url(${currentSong?.cover})`,
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
