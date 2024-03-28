import MusicEntery from "./MusicEntery";
import playlistImage from "../images/playlist.png";
import { PlayerContext } from "./PlayerContext";
import { useContext } from "react";
import * as playerOptions from "../playerOptions";

export default function Playlist({ togglePlaylistShow }) {
    const { clearList, appendList, playlist } = useContext(PlayerContext);
    const musicList = (list) => {
        return list.map((song) => {
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
                />
            );
        });
    };

    const Clear = () => {
        clearList();
    };

    const addSong = async (e) => {
        const songs = await playerOptions.getSongListFromFiles(e.target.files);
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
                {musicList(playlist)}
                <div className="playlist-end">
                    The <span>♥</span> End
                </div>
            </div>
        </>
    );
}
