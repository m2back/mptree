import { createContext, useState, useEffect } from "react";
import * as mm from "music-metadata-browser";
import { md5 } from "js-md5";
import noCoverImage from "./images/nocover.png";

const PlayerContext = createContext();

export const usePlayerState = () => {
    const [originalPlaylist, setOriginalPlaylist] = useState([]);
    const [playlist, setPlaylist] = useState([]);
    const [currentSongId, setCurrentSongId] = useState(null);
    const [shuffleMode, setShuffleMode] = useState("off");
    const [repeatMode, setRepeatMode] = useState("off");
    const [playTimes, setPlayTimes] = useState({});

    useEffect(() => {
        const playTimesLS = localStorage.getItem("playTimes");
        if (playTimesLS) {
            setPlayTimes(JSON.parse(playTimesLS));
        }
    }, []);

    useEffect(() => {
        const playTimesTracker = JSON.stringify(playTimes);
        const interval = setInterval(() => {
            localStorage.setItem("playTimes", playTimesTracker);
        }, 5000);
        return () => clearInterval(interval);
    }, [playTimes]);

    const audio = new Audio();

    /* ---------------Internal Functions----------------- */

    const shuffleArray = (array) => {
        let currentIndex = array.length,
            randomIndex;

        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex],
            ];
        }

        return array;
    };

    function splitArrayToChunks(arr, chunk) {
        let chunkSize;

        if (arr.length < chunk) {
            chunkSize = 1;
        } else {
            chunkSize = Math.floor(arr.length / chunk);
        }

        const result = [];

        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }

        return result;
    }

    const smartShuffle = (playlist, playTimes) => {
        // Adding Playtime to playlist
        const playlistWPT = playlist.map((song) => {
            return { ...song, playtime: playTimes[song?.id] || 0 };
        });

        //Sort Playlist by Playtime
        const sortedPlaylist = playlistWPT.sort(
            (a, b) => b.playtime - a.playtime
        );

        //Split Playtime by 20% of length
        const playlistChunks = splitArrayToChunks(sortedPlaylist, 5);

        //Shuffle Each section of playlist Randomly
        const shuffledChunks = playlistChunks.map((item) => {
            return shuffleArray(item);
        });

        //Merging all items in Playlist to be Flatten
        const shuffledPlaylist = shuffledChunks.flat(2);

        //Move Current song to top of playlist
        shuffledPlaylist.sort((x, y) => {
            return x.id == currentSongId ? -1 : y.id == currentSongId ? 1 : 0;
        });
        return shuffledPlaylist;
    };

    const setAudio = (index) => {
        audio.src = playlist[index].address;
        setCurrentSongId(playlist[index].id);
        audio.play();
    };

    const getSongDetail = async (file) => {
        try {
            const fileURL = URL.createObjectURL(file);
            const metadata = await mm.parseBlob(file);
            let imageURL;
            if (metadata.common.picture) {
                const pictureData = metadata.common.picture[0];
                const imageBlob = new Blob([pictureData.data], {
                    type: pictureData.format,
                });
                imageURL = URL.createObjectURL(imageBlob);
            } else {
                imageURL = noCoverImage;
            }

            return {
                id: md5(file.name),
                name: file.name.split(".").slice(0, -1).join("."),
                address: fileURL,
                title:
                    metadata.common.title ||
                    file.name.split(".").slice(0, -1).join("."),
                artist: metadata.common.artist || "Unknown Artist",
                album: metadata.common.album || "Unknown Album",
                cover: imageURL,
            };
        } catch (e) {
            if (
                e.name === "SecurityError" &&
                e.message.includes(
                    "A security issue was found and the operation was prevented"
                )
            ) {
                console.error(
                    "Error: Unable to create URL for local file due to security restrictions."
                );
            } else {
                console.log("Failed to Get Song Detail\n" + e.message);
                throw new Error(e.message);
            }
        }
    };

    const parsLyric = (text) => {
        const regex = /\[(.*)\](.*)/gm;
        let match;
        let lyrics = [];

        while ((match = regex.exec(text)) !== null) {
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            let time = match[1].slice(1).split(":");
            time = (time[0] * 60 + time[1] * 1).toFixed(2);
            lyrics.push({ start: time, text: match[2] });
        }

        for (let i = 0; i < lyrics.length - 1; i++) {
            lyrics[i].end = lyrics[i + 1].start;
        }

        return lyrics;
    };

    const getLyricsFromFile = async (file) => {
        try {
            const response = await fetch(URL.createObjectURL(file));
            const lyric = parsLyric(await response.text());
            return {
                name: file.name.split(".").slice(0, -1).join("."),
                lyric: lyric,
            };
        } catch (e) {
            console.log("Failed to Get Song Lyric\n");
            console.log(e.message);
            throw e.message;
        }
    };

    /* ---------------Internal Event Listeners----------------- */

    audio.addEventListener("ended", () => {
        const currentSongIndex = playlist.findIndex(
            (song) => song.id === currentSongId
        );
        if (repeatMode === "single") {
            setAudio(currentSongIndex);
        } else if (
            currentSongIndex === playlist.length - 1 &&
            repeatMode === "all"
        ) {
            setAudio(0);
        } else if (currentSongIndex < playlist.length - 1) {
            setAudio(currentSongIndex + 1);
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (!audio.paused) {
                if (!playTimes[currentSongId]) {
                    setPlayTimes((prevPlayTimes) => ({
                        ...prevPlayTimes,
                        [currentSongId]: 0,
                    }));
                } else {
                    setPlayTimes((prevPlayTimes) => ({
                        ...prevPlayTimes,
                        [currentSongId]: prevPlayTimes[currentSongId] + 1,
                    }));
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentSongId, audio.paused]);

    /* ---------------Export Functions----------------- */

    // Initializing

    const initialPlayer = () => {
        if (originalPlaylist) {
            setPlaylist([...originalPlaylist]);
            setAudio(0);
        }
    };

    const playlistChange = () => {
        if (originalPlaylist && originalPlaylist.length > 0) {
            if (shuffleMode === "normal") {
                setPlaylist(shuffleArray([...originalPlaylist]));
            } else if (shuffleMode === "smart") {
                setPlaylist(smartShuffle([...originalPlaylist], playTimes));
            } else if (shuffleMode === "off") {
                setPlaylist([...originalPlaylist]);
            }
        }
    };

    // Playlist Options

    const getPlaylist = () => {
        return originalPlaylist;
    };

    const setList = (list) => {
        setOriginalPlaylist(list);
        playlistChange();
        audio.dispatchEvent(new Event("playlistchange"));
        audio.dispatchEvent(new Event("listloaded"));
    };

    const appendList = (list) => {
        setOriginalPlaylist((prevOriginalPlaylist) =>
            prevOriginalPlaylist.concat(
                list.filter(
                    (item2) =>
                        !prevOriginalPlaylist.find(
                            (item1) => item1.id === item2.id
                        )
                )
            )
        );
        playlistChange();
        audio.dispatchEvent(new Event("playlistchange"));
    };

    const clearList = () => {
        setOriginalPlaylist([]);
        setPlaylist([]);
        setCurrentSongId(null);
        audio.src = "";
        audio.dispatchEvent(new Event("playlistchange"));
        audio.dispatchEvent(new Event("srccleared"));
    };

    //Creating Function To Create a list of Songs with Lyric from files

    const getSongListFromFiles = async (files) => {
        try {
            const fileList = Array.from(files);
            const musicDataPromises = fileList.map(async (file) => {
                if (
                    file.name.endsWith(".mp3") ||
                    file.name.endsWith(".ogg") ||
                    file.name.endsWith(".m4a")
                ) {
                    return await getSongDetail(file);
                }
                return null;
            });

            const lyricDataPromises = fileList.map(async (file) => {
                if (file.name.endsWith(".lrc")) {
                    return await getLyricsFromFile(file);
                }
                return null;
            });

            //getting music data and lyric after that
            const musicData = await Promise.all(musicDataPromises);
            const lyricData = await Promise.all(lyricDataPromises);

            //filtering out empty items
            const songList = [
                ...musicData.filter(Boolean),
                ...lyricData.filter(Boolean),
            ];

            //merging music and lyric with name of them
            const mergedArray = {};
            songList.forEach((item) => {
                if (item !== null) {
                    if (mergedArray[item.name]) {
                        Object.assign(mergedArray[item.name], item);
                    } else {
                        mergedArray[item.name] = item;
                    }
                }
            });

            //removing lyric only item
            const filteredSongList = Object.values(mergedArray).filter(
                (item) => item.id
            );
            return filteredSongList;
        } catch (e) {
            console.log("Failed to get Files from list");
            console.log(e.message);
            throw e;
        }
    };

    // Player Controls

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

    const play = () => {
        audio.play();
    };
    const pause = () => {
        audio.pause();
    };

    const next = () => {
        const currentSongIndex = playlist.findIndex((song) => {
            return song.id == currentSongId;
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
            return song.id == currentSongId;
        });
        if (currentSongIndex !== 0) {
            setAudio(currentSongIndex - 1);
        } else {
            setAudio(playlist.length - 1);
        }
    };

    const toggleShuffle = () => {
        if (shuffleMode === "off") {
            setShuffleMode("normal");
            setPlaylist(shuffleArray([...originalPlaylist]));
        } else if (shuffleMode === "normal") {
            setShuffleMode("smart");
            setPlaylist(smartShuffle([...originalPlaylist], playTimes));
        } else if (shuffleMode === "smart") {
            setShuffleMode("off");
            setPlaylist([...originalPlaylist]);
        }
    };

    const toggleRepeat = () => {
        if (repeatMode === "off") {
            setRepeatMode("all");
        } else if (repeatMode === "all") {
            setRepeatMode("single");
        } else if (repeatMode === "single") {
            setRepeatMode("off");
        } else {
            setRepeatMode("off");
        }
    };

    const seek = (time) => {
        audio.currentTime = time;
    };

    const getLyrics = () => {
        const song = originalPlaylist.find((song) => {
            return song.id === currentSongId && song.lyric;
        });
        if (song) {
            return song.lyric;
        } else {
            return null;
        }
    };

    //Status of Player

    const getCurrentSongId = () => {
        return currentSongId;
    };

    const getRepeat = () => {
        return repeatMode;
    };

    const getShuffle = () => {
        return shuffleMode;
    };

    const getCover = () => {
        const currentSongIndex = playlist.findIndex((song) => {
            return song.id === currentSongId;
        });
        if (playlist[currentSongIndex]) {
            return playlist[currentSongIndex].cover;
        } else {
            return noCoverImage;
        }
    };

    const getSongName = () => {
        const currentSongIndex = playlist.findIndex((song) => {
            return song.id === currentSongId;
        });
        if (playlist[currentSongIndex]) {
            return playlist[currentSongIndex].title;
        }
    };

    const getArtistName = () => {
        const currentSongIndex = playlist.findIndex((song) => {
            return song.id === currentSongId;
        });
        if (playlist[currentSongIndex]) {
            return playlist[currentSongIndex].artist;
        }
    };

    return {
        originalPlaylist,
        setOriginalPlaylist,
        playlist,
        currentSongId,
        shuffleMode,
        repeatMode,
        playTimes,
        audio,
        initialPlayer,
        getPlaylist,
        setList,
        appendList,
        clearList,
        getSongListFromFiles,
        playSongById,
        play,
        pause,
        next,
        prev,
        toggleShuffle,
        toggleRepeat,
        seek,
        getLyrics,
        getCurrentSongId,
        getRepeat,
        getShuffle,
        getCover,
        getSongName,
        getArtistName,
    };
};

export default PlayerContext;
