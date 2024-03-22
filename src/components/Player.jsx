import * as mm from "music-metadata-browser";
import { md5 } from "js-md5";

/* ---------------Initializing Default Values----------------- */
let originalPlaylist = [];
let playlist = [];
let currentSongId = null;
let shuffleMode = false;
let repeatMode = "off";
export const audio = new Audio();

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

const setAudio = (index) => {
    audio.src = playlist[index].address;
    currentSongId = playlist[index].id;
    audio.play();
};

const getSongDetail = async (file) => {
    try {
        const fileURL = URL.createObjectURL(file);
        const metadata = await mm.parseBlob(file);
        const pictureData = metadata.common.picture[0];
        const imageBlob = new Blob([pictureData.data], {
            type: pictureData.format,
        });
        let imageURL = URL.createObjectURL(imageBlob);
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

/* ---------------Export Functions----------------- */

// Initializing

export const initialPlayer = () => {
    if (originalPlaylist) {
        playlist = [...originalPlaylist];
        setAudio(0);
    }
};

const playlistChange = () => {
    if (originalPlaylist?.length >= 0) {
        if (!shuffleMode) {
            playlist = shuffleArray([...originalPlaylist]);
        } else {
            playlist = [...originalPlaylist];
            playlist = shuffleArray(playlist);
        }
    }
};

// Playlist Options

export const getPlaylist = () => {
    return originalPlaylist;
};

export const setList = (list) => {
    originalPlaylist = list;
    playlistChange();
    audio.dispatchEvent(new Event("playlistchange"));
    audio.dispatchEvent(new Event("listloaded"));
};

export const appendList = (list) => {
    originalPlaylist = originalPlaylist.concat(
        list.filter(
            (item2) => !originalPlaylist.find((item1) => item1.id === item2.id)
        )
    );
    playlistChange();
    audio.dispatchEvent(new Event("playlistchange"));
};

export const clearList = () => {
    originalPlaylist = [];
    playlistChange();
    audio.src = "";
    audio.dispatchEvent(new Event("playlistchange"));
    audio.dispatchEvent(new Event("srccleared"));
};

//Creating Function To Create a list of Songs with Lyric from files

export const getSongListFromFiles = async (files) => {
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

export const playSongById = (id) => {
    const foundSongIndex = playlist.findIndex((song) => {
        return song.id == id;
    });

    if (foundSongIndex >= 0) {
        setAudio(foundSongIndex);
    } else {
        console.log(`Song  with ID: ${id} Not Found`);
    }
};

export const play = () => {
    audio.play();
};
export const pause = () => {
    audio.pause();
};

export const next = () => {
    const currentSongIndex = playlist.findIndex((song) => {
        return song.id == currentSongId;
    });
    if (currentSongIndex < playlist.length - 1) {
        setAudio(currentSongIndex + 1);
    } else {
        setAudio(0);
    }
    repeatMode === "single" ? (repeatMode = "all") : null;
};

export const prev = () => {
    const currentSongIndex = playlist.findIndex((song) => {
        return song.id == currentSongId;
    });
    if (currentSongIndex !== 0) {
        setAudio(currentSongIndex - 1);
    } else {
        setAudio(playlist.length - 1);
    }
};

export const toggleShuffle = () => {
    if (!shuffleMode) {
        shuffleMode = true;
        playlist = shuffleArray([...originalPlaylist]);
    } else {
        shuffleMode = false;
        playlist = [...originalPlaylist];
    }
};

export const toggleRepeat = () => {
    if (repeatMode == "off") {
        repeatMode = "all";
    } else if (repeatMode == "all") {
        repeatMode = "single";
    } else if (repeatMode == "single") {
        repeatMode = "off";
    } else {
        repeatMode = "off";
    }
};

export const seek = (time) => {
    audio.currentTime = time;
};

export const getLyrics = () => {
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

export const getCurrentSongId = () => {
    return currentSongId;
};

export const getRepeat = () => {
    return repeatMode;
};

export const getShuffle = () => {
    return shuffleMode;
};

export const getCover = () => {
    const currentSongIndex = playlist.findIndex((song) => {
        return song.id === currentSongId;
    });
    if (playlist[currentSongIndex]) {
        return playlist[currentSongIndex].cover;
    } else {
        return "/images/samplecover.jpg";
    }
};

export const getSongName = () => {
    const currentSongIndex = playlist.findIndex((song) => {
        return song.id === currentSongId;
    });
    if (playlist[currentSongIndex]) {
        return playlist[currentSongIndex].title;
    }
};

export const getArtistName = () => {
    const currentSongIndex = playlist.findIndex((song) => {
        return song.id === currentSongId;
    });
    if (playlist[currentSongIndex]) {
        return playlist[currentSongIndex].artist;
    }
};
