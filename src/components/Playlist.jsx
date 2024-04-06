import MusicEntery from "./MusicEntery";
import playlistImage from "../images/playlist.png";
import { PlayerContext } from "./PlayerContext";
import { useContext, useState } from "react";
import { BarLoader } from "react-spinners";
import * as playerOptions from "../playerOptions";
import React from "react";

function Playlist({ togglePlaylistShow }) {
    const { clearList, appendList, playlist } = useContext(PlayerContext);
    const [loadingList, setLoadingList] = useState(false);
    const musicList = playlist.map((song) => {
        return (
            <MusicEntery
                key={song.id}
                id={song.id}
                url={song.address}
                cover={song.cover}
                album={song.album}
                artist={song.artist}
                title={song.title}
                lyric={song.lyric ? true : false}
                format={song.format}
                address={song.address}
                name={song.name}
            />
        );
    });

    const Clear = () => {
        clearList();
    };

    const addSong = async (e) => {
        setLoadingList(true);
        const songs = await playerOptions.getSongListFromFiles(e.target.files);
        setLoadingList(false);
        appendList(songs);
    };

    return (
        <>
            <div className="playlist">
                <div className="playlist-start">
                    <input
                        id="addSong"
                        type="file"
                        multiple={true}
                        accept=".mp3, .m4a, .ogg, .lrc"
                        className="open-button"
                        onChange={addSong}
                        style={{ display: "none" }}
                    />
                    <img
                        onClick={togglePlaylistShow}
                        className="list-exit button"
                        alt="List Exit"
                        src={playlistImage}
                    />
                    <label htmlFor="addSong" className="button">
                        Add Song
                    </label>
                    <span onClick={Clear} className="button">
                        Clear
                    </span>
                </div>
                {musicList}
                {loadingList && (
                    <div className="playlist-loading">
                        <BarLoader color="#36d7b7" />
                    </div>
                )}
                <div className="playlist-end">
                    The <span>♥</span> End
                </div>
            </div>
        </>
    );
}
const MemoizedPlaylist = React.memo(Playlist);
export default MemoizedPlaylist;
