import { useState } from "react";
import * as player from "../player";
import loadingImage from "../images/loading.gif";
import musicNoteImage from "../images/music-note.png";

export default function SelectPage({ toggleShowPlayer }) {
    const [loading, setLoading] = useState(false);
    const setSong = async (e) => {
        setLoading(true);
        const songs = await player.getSongListFromFiles(e.target.files);
        if (songs?.length > 0) {
            toggleShowPlayer();
            player.setList(songs);
            player.initialPlayer();
        } else {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="open-windows">
                {!loading && (
                    <div>
                        <input
                            id="file-upload"
                            type="file"
                            multiple={true}
                            accept=".mp3, .m4a, .ogg, .lrc"
                            className="open-button"
                            onChange={setSong}
                        />
                        <label
                            htmlFor="file-upload"
                            className="open-button-holder"
                            style={{
                                backgroundImage: `url(${musicNoteImage})`,
                            }}
                        >
                            Select songs...
                        </label>
                    </div>
                )}
                {loading && (
                    <>
                        <div className="loading-continer">
                            <div className="loading">Loading</div>
                            <img src={loadingImage}></img>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
