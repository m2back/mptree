import { useContext, useState } from "react";
import * as playerOptions from "../playerOptions";
import { PlayerContext } from "./PlayerContext";
import { BeatLoader } from "react-spinners";
import musicNoteImage from "../images/music-note.png";

export default function SelectPage({ toggleShowPlayer }) {
    const { setList } = useContext(PlayerContext);
    const [loading, setLoading] = useState(false);
    const setSong = async (e) => {
        setLoading(true);
        const list = await playerOptions.getSongListFromFiles(e.target.files);
        if (list?.length > 0) {
            toggleShowPlayer();
            setList(list);
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
                            <BeatLoader color="#36d7b7" />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
