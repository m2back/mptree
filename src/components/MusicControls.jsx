import { useEffect, useState } from "react";
import * as player from "../player";

import { PiShuffleBold, PiShuffleDuotone } from "react-icons/pi";
import { TbRepeatOnce, TbRepeat } from "react-icons/tb";
import { GrPrevious, GrNext } from "react-icons/gr";
import { FaPlay, FaPause } from "react-icons/fa";

export default function MusicControls() {
    const [shuffle, setShuffle] = useState(player.getShuffle());
    const [repeat, setRepeat] = useState(player.getRepeat());
    const [isPlaying, setIsPlaying] = useState(true);
    const size = 20;

    const shuffleIcons = {
        off: (
            <PiShuffleBold
                size={size}
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

    const handleShuffle = () => {
        player.toggleShuffle();
        setShuffle(player.getShuffle());
    };

    const handleRepeat = () => {
        player.toggleRepeat();
        setRepeat(player.getRepeat());
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
    };

    useEffect(() => {
        player.audio.addEventListener("play", () => {
            setIsPlaying(true);
        });
        player.audio.addEventListener("pause", () => {
            setIsPlaying(false);
        });
        player.audio.addEventListener("loadedmetadata", () => {
            setRepeat(player.getRepeat());
        });
        player.audio.addEventListener("srccleared", () => {
            setIsPlaying(false);
        });
    }, []);

    return (
        <>
            <div className="music-controls">
                <span className="button" onClick={handleShuffle}>
                    {shuffleIcons[shuffle]}
                </span>
                <GrPrevious
                    size={size * 1.3}
                    className="button white react-icon"
                    onClick={player.prev}
                />
                <span className="button" onClick={handlePlayPause}>
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
                    onClick={player.next}
                />
                <span className="button" onClick={handleRepeat}>
                    {repeatIcons[repeat]}
                </span>
            </div>
        </>
    );
}
