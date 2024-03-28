import { createContext, useEffect, useRef, useState } from "react";
import * as playerOptions from "../playerOptions";

const PlayerContext = createContext();

export default function App({ children }) {
    const [audio] = useState(new Audio());
    const [originalPlaylist, setOriginalPlaylist] = useState([]);
    const [playlist, setPlaylist] = useState([]);
    const [shuffleMode, setShuffleMode] = useState("off");
    const [repeatMode, setRepeatMode] = useState("off");
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentTimePercent, setCurrentTimePercent] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeLyricIndex, setActiveLyricIndex] = useState(0);
    const currentSongRef = useRef();
    const playlistRef = useRef();
    const repeatRef = useRef();
    const isPlaylistEmpty = useRef(true);
    const [playTimes, setPlayTimes] = useState(
        JSON.parse(localStorage.getItem("playTimes")) || {}
    );
    useEffect(() => {
        playlistRef.current = playlist;
    }, [playlist]);
    useEffect(() => {
        currentSongRef.current = currentSong;
    }, [currentSong]);
    useEffect(() => {
        repeatRef.current = repeatMode;
    }, [repeatMode]);

    const setAudio = (index) => {
        console.log(playlistRef.current);
        if (playlistRef.current.length > 0) {
            audio.src = playlistRef.current[index].address;
            setCurrentSong(playlistRef.current[index]);
            audio.play();
        } else {
            console.log("Set Audio: Playlist is Empty.");
        }
    };

    useEffect(() => {
        if (currentSongRef.current?.lyric && isPlaying) {
            const foundIndex = currentSongRef.current.lyric.findIndex(
                (lyric) => {
                    if (
                        lyric.start <= currentTime &&
                        lyric.end >= currentTime
                    ) {
                        return true;
                    }
                }
            );
            setActiveLyricIndex(foundIndex);
        }
    }, [currentTime]);

    useEffect(() => {
        if (isPlaylistEmpty.current && originalPlaylist.length > 0) {
            setPlaylist([...originalPlaylist]);
        }
        if (originalPlaylist && originalPlaylist.length > 0) {
            if (shuffleMode === "normal") {
                setPlaylist(playerOptions.shuffleArray([...originalPlaylist]));
            } else if (shuffleMode === "smart") {
                setPlaylist(
                    playerOptions.smartShuffle(
                        [...originalPlaylist],
                        playTimes,
                        currentSong.id
                    )
                );
            } else if (shuffleMode === "off") {
                setPlaylist([...originalPlaylist]);
            }
        }
    }, [originalPlaylist]);

    useEffect(() => {
        if (isPlaylistEmpty.current && playlist.length > 0) {
            setAudio(0);
            isPlaylistEmpty.current = false;
        }
    }, [playlist]);

    useEffect(() => {
        const playtimeCounter = () => {
            if (!audio.paused && currentSong) {
                setPlayTimes((prevTimes) => {
                    let newTimes = prevTimes;
                    if (!newTimes[currentSong.id]) {
                        newTimes = { ...newTimes, [currentSong.id]: 0 };
                    }
                    newTimes[currentSong.id] = newTimes[currentSong.id] + 1;
                    const rand = Math.floor(Math.random() * 100);
                    if (rand > 60) {
                        localStorage.setItem(
                            "playTimes",
                            JSON.stringify(newTimes)
                        );
                    }
                    return newTimes;
                });
            }
        };

        const playtimeInterval = setInterval(playtimeCounter, 2000);

        return () => {
            clearInterval(playtimeInterval);
        };
    }, [currentSong]);

    const setList = (list) => {
        setOriginalPlaylist(list);
    };

    const appendList = (list) => {
        const filteredList = list.filter(
            (item2) => !originalPlaylist.find((item1) => item1.id === item2.id)
        );
        setOriginalPlaylist((prevList) => {
            return [...prevList, ...filteredList];
        });
    };

    const clearList = () => {
        setOriginalPlaylist([]);
        setPlaylist([]);
        setCurrentSong(false);
        setCurrentTimePercent(0);
        setIsPlaying(false);
        audio.src = "";
        isPlaylistEmpty.current = true;
    };

    const play = () => {
        audio.play();
    };

    const togglePlayPause = () => {
        if (audio) {
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
    };

    const toggleRepeat = () => {
        if (repeatMode == "off") {
            setRepeatMode("all");
        } else if (repeatMode == "all") {
            setRepeatMode("single");
        } else if (repeatMode == "single") {
            setRepeatMode("off");
        } else {
            setRepeatMode("off");
        }
    };

    const toggleShuffle = () => {
        if (shuffleMode === "off") {
            setShuffleMode("normal");
            setPlaylist(playerOptions.shuffleArray([...originalPlaylist]));
        } else if (shuffleMode === "normal") {
            setShuffleMode("smart");
            setPlaylist(
                playerOptions.smartShuffle(
                    [...originalPlaylist],
                    playTimes,
                    currentSong.id
                )
            );
        } else if (shuffleMode === "smart") {
            setShuffleMode("off");
            setPlaylist([...originalPlaylist]);
        }
    };
    const next = () => {
        const currentSongIndex = playlist.findIndex((song) => {
            return song.id == currentSong.id;
        });
        if (currentSongIndex < playlist.length - 1) {
            setAudio(currentSongIndex + 1);
        } else {
            setAudio(0);
        }
        if (repeatMode === "single") {
            setRepeatMode("all");
        }
    };

    const prev = () => {
        const currentSongIndex = playlist.findIndex((song) => {
            return song.id == currentSong.id;
        });
        if (currentSongIndex !== 0) {
            setAudio(currentSongIndex - 1);
        } else {
            setAudio(playlist.length - 1);
        }
    };

    const playSongById = (id) => {
        const foundSongIndex = playlist.findIndex((song) => {
            return song.id == id;
        });

        if (foundSongIndex >= 0) {
            setAudio(foundSongIndex);
        } else {
            console.log(`Song  with ID: ${id} Not Found`);
        }
    };

    const seek = (time) => {
        audio.currentTime = time;
    };

    const setTime = (time) => {
        audio.currentTime = time;
    };

    useEffect(() => {
        const handleEnd = () => {
            const currentSongIndex = playlistRef.current.findIndex(
                (song) => song.id === currentSongRef.current.id
            );
            if (repeatRef.current === "single") {
                setAudio(currentSongIndex);
            } else if (
                currentSongIndex === playlistRef.current.length - 1 &&
                repeatRef.current === "all"
            ) {
                setAudio(0);
            } else if (currentSongIndex < playlistRef.current.length - 1) {
                setAudio(currentSongIndex + 1);
            }
        };
        const handlePlay = () => {
            setIsPlaying(true);
        };
        const handlePause = () => {
            setIsPlaying(false);
        };
        const handleSrcCleared = () => {
            setIsPlaying(false);
            setCurrentTimePercent(0);
        };
        const handleTimeupdate = () => {
            setTimeout(() => {
                const currentTime = audio.currentTime;
                const musicDuration = audio.duration;
                const percent = (currentTime / musicDuration) * 100;
                setCurrentTimePercent(percent);
                setCurrentTime(audio.currentTime);
            }, 500);
        };
        const handleMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener("ended", handleEnd);
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("srccleared", handleSrcCleared);
        audio.addEventListener("timeupdate", handleTimeupdate);
        audio.addEventListener("loadedmetadata", handleMetadata);

        return () => {
            audio.removeEventListener("ended", handleEnd);
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("srccleared", handleSrcCleared);
            audio.removeEventListener("timeupdate", handleTimeupdate);
            audio.removeEventListener("loadedmetadata", handleMetadata);
        };
    }, []);

    const playlistContent = {
        playlist,
        currentSong,
        isPlaying,
        shuffleMode,
        toggleShuffle,
        repeatMode,
        toggleRepeat,
        togglePlayPause,
        next,
        prev,
        setList,
        appendList,
        clearList,
        seek,
        duration,
        currentTimePercent,
        currentTime,
        playSongById,
        setTime,
        play,
        activeLyricIndex,
    };
    return (
        <PlayerContext.Provider value={playlistContent}>
            {children}
        </PlayerContext.Provider>
    );
}

export { PlayerContext };
