import MusicEntery from "./MusicEntery";
import * as player from "../player";
import { useEffect, useState } from "react";

export default function Playlist({ togglePlaylistShow }) {
    const [songList, setSongList] = useState(player.getPlaylist());
    useEffect(() => {
        player.audio.addEventListener("playlistchange", () => {
            setSongList(player.getPlaylist());
        });
    }, []);

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
        player.clearList();
    };

    const addSong = async (e) => {
        const songs = await player.getSongListFromFiles(e.target.files);
        player.appendList(songs);
    };

    return (
        <>
            <div className="playlist" id="playlist">
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
                        src="./images/playlist.png"
                    />
                    <label htmlFor="addSong" className="button">
                        Add Song
                    </label>
                    <span onClick={Clear} className="button">
                        Clear
                    </span>
                </div>
                {musicList(songList)}
                <div className="playlist-end">
                    The <span>♥</span> End
                </div>
            </div>
        </>
    );
}
