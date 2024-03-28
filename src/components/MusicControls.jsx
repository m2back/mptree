import { PlayerContext } from "./PlayerContext";
import { PiShuffleBold, PiShuffleDuotone } from "react-icons/pi";
import { TbRepeatOnce, TbRepeat } from "react-icons/tb";
import { GrPrevious, GrNext } from "react-icons/gr";
import { FaPlay, FaPause } from "react-icons/fa";
import { useContext } from "react";

export default function MusicControls() {
    const {
        repeatMode,
        toggleRepeat,
        shuffleMode,
        toggleShuffle,
        togglePlayPause,
        isPlaying,
        prev,
        next,
    } = useContext(PlayerContext);

    const size = 20;
    const shuffleIcons = {
        off: (
            <PiShuffleBold
                size={size * 0.9}
                className="white react-icon icon-disable"
            />
        ),
        normal: (
            <PiShuffleBold size={size * 0.9} className="white react-icon" />
        ),
        smart: (
            <PiShuffleDuotone size={size * 0.9} className="white react-icon" />
        ),
    };

    const repeatIcons = {
        off: (
            <TbRepeat
                size={size * 0.9}
                className="white react-icon icon-disable"
            />
        ),
        all: <TbRepeat size={size * 0.9} className="white react-icon" />,
        single: <TbRepeatOnce size={size * 0.9} className="white react-icon" />,
    };

    return (
        <>
            <div className="music-controls">
                <span className="button" onClick={toggleShuffle}>
                    {shuffleIcons[shuffleMode]}
                </span>
                <GrPrevious
                    size={size * 1.3}
                    className="button white react-icon"
                    onClick={prev}
                />
                <span className="button" onClick={togglePlayPause}>
                    {isPlaying ? (
                        <FaPause
                            size={size * 1.4}
                            className="button white react-icon"
                        />
                    ) : (
                        <FaPlay
                            size={size * 1.4}
                            className="button white react-icon"
                        />
                    )}
                </span>
                <GrNext
                    size={size * 1.2}
                    className="button white react-icon"
                    onClick={next}
                />
                <span className="button" onClick={toggleRepeat}>
                    {repeatIcons[repeatMode]}
                </span>
            </div>
        </>
    );
}
