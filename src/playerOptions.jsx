import * as mm from "music-metadata-browser";
import { md5 } from "js-md5";
import noCoverImage from "./images/nocover.png";

export const shuffleArray = (array) => {
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

const splitArrayToChunks = (arr, chunk) => {
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
};

export const smartShuffle = (playlist, playTimes, currentSongId) => {
    // Adding Playtime to playlist
    const playlistWPT = playlist.map((song) => {
        return { ...song, playtime: playTimes[song?.id] || 0 };
    });

    //Sort Playlist by Playtime
    const sortedPlaylist = playlistWPT.sort((a, b) => b.playtime - a.playtime);

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