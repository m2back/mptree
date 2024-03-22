import * as mm from "music-metadata-browser";
import { md5 } from "js-md5";

/* ---------------Initializing Default Values----------------- */
let initialPlaylist = [];
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
        let imageURL = null;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
            const pictureData = metadata.common.picture[0];
            const base64String = btoa(
                String.fromCharCode(...new Uint8Array(pictureData.data))
            );
            imageURL = `data:${pictureData.format};base64,${base64String}`;
        }
        return {
            id: md5(file.name),
            name: file.name.split(".").slice(0, -1).join("."),
            address: fileURL,
            title: metadata.common.title,
            artist: metadata.common.artist,
            album: metadata.common.album,
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
        lyrics[i].end = lyrics[i + 1].start - 0.01;
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
    if (initialPlaylist) {
        playlist = [...initialPlaylist];
        setAudio(0);
    }
};

const playlistChange = () => {
    if (initialPlaylist?.length >= 0) {
        if (!shuffleMode) {
            playlist = shuffleArray([...initialPlaylist]);
        } else {
            playlist = [...initialPlaylist];
            playlist = shuffleArray(playlist);
        }
    }
};

// Playlist Options

export const getPlaylist = () => {
    return initialPlaylist;
};

export const setList = (list) => {
    initialPlaylist = list;
    playlistChange();
    audio.dispatchEvent(new Event("playlistchange"));
    audio.dispatchEvent(new Event("listloaded"));
};

export const appendList = (list) => {
    initialPlaylist = initialPlaylist.concat(
        list.filter(
            (item2) => !initialPlaylist.find((item1) => item1.id === item2.id)
        )
    );
    // initialPlaylist = initialPlaylist.concat(list);
    playlistChange();
    audio.dispatchEvent(new Event("playlistchange"));
};

export const clearList = () => {
    initialPlaylist = [];
    playlistChange();
    audio.src = "";
    audio.dispatchEvent(new Event("playlistchange"));
    audio.dispatchEvent(new Event("srccleared"));
};

//Creating Function To Create a list of Songs with Lyric from files

export const getSongListFromFiles = async (files) => {
    try {
        const fileList = Array.from(files);
        const songListPromise = await fileList.map((file) => {
            if (file.name.endsWith(".mp3" || ".ogg" || ".m4a")) {
                return getSongDetail(file);
            } else if (file.name.endsWith(".lrc")) {
                return getLyricsFromFile(file);
            }
        });

        let songList = await Promise.all(songListPromise);
        let mergedArray = {};

        songList.forEach((item) => {
            if (mergedArray[item.name]) {
                Object.assign(mergedArray[item.name], item);
            } else {
                mergedArray[item.name] = item;
            }
        });
        songList = Object.values(mergedArray);

        // deleting Lyrics only items
        songList = songList.filter((item) => item.id);
        return songList;
    } catch (e) {
        console.log("Failed to get Files from list");
        console.log(e.message);
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
    repeatMode === "single" ? (repeatMode = "off") : null;
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
        playlist = shuffleArray([...initialPlaylist]);
    } else {
        shuffleMode = false;
        playlist = [...initialPlaylist];
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
    const song = initialPlaylist.find((song) => {
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
