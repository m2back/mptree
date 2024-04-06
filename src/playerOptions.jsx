import noCoverImage from "./images/nocover.png";
import axios from "axios";
import * as mm from "music-metadata-browser";
import { md5 } from "js-md5";
import { toast } from "react-hot-toast";
import { IoCloudDownload } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";

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

const getSongDetailfromFile = async (file) => {
    try {
        const fileURL = URL.createObjectURL(file);
        const metadata = await mm.parseBlob(file);
        const format = file.name.split(".").pop();
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
        const list = {
            id: md5(file.name),
            name: file.name.split(".").slice(0, -1).join("."),
            format: format,
            address: fileURL,
            title:
                metadata.common.title ||
                file.name.split(".").slice(0, -1).join("."),
            artist: metadata.common.artist || "Unknown Artist",
            album: metadata.common.album || "Unknown Album",
            cover: imageURL,
        };
        return list;
    } catch (e) {
        console.log("Failed to Get Song Detail\n" + e.message);
        throw new Error(e.message);
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
        const fileList = [...files];

        const isMusic = (file) => /\.(mp3|ogg|m4a)$/.test(file.name);
        const isLyric = (file) => /\.(lrc)$/.test(file.name);

        const musicData = await fileList.reduce(async (accPromise, curr) => {
            const acclumaitor = await accPromise;
            const result = isMusic(curr)
                ? await getSongDetailfromFile(curr)
                : isLyric(curr)
                ? await getLyricsFromFile(curr)
                : null;

            if (result) {
                const index = acclumaitor.findIndex(
                    (item) => item.name === result.name
                );
                if (index !== -1) {
                    acclumaitor[index] = { ...acclumaitor[index], ...result };
                } else {
                    acclumaitor.push(result);
                }
            }
            return acclumaitor;
        }, []);

        //removing lyric only item
        const filteredSongList = [...musicData].filter((item) => item.id);

        return filteredSongList;
    } catch (e) {
        console.log("Failed to get Files from list");
        console.log(e.message);
        throw e;
    }
};

export const favToggle = (id) => {
    const favlist = JSON.parse(localStorage.getItem("favoriteSongs")) || [];
    const index = favlist.indexOf(id);
    if (index > -1) {
        favlist.splice(index, 1);
    } else {
        favlist.push(id);
    }
    localStorage.setItem("favoriteSongs", JSON.stringify(favlist));
};
const toastElement = (name, text, action, onClick = () => {}) => {
    return (
        <div className="toast-container">
            <div>
                <div>{name}</div>
                <div>{text}</div>
            </div>

            {action && (
                <div onClick={onClick} className="toast-sub-action">
                    {action}
                </div>
            )}
        </div>
    );
};

const downloadFile = async (downloadLink, notifId, notifTitle) => {
    const source = axios.CancelToken.source();
    try {
        const response = await axios({
            method: "get",
            url: downloadLink,
            responseType: "blob",
            cancelToken: source.token,
            onDownloadProgress: (progressEvent) => {
                const total = progressEvent.total;
                const loaded = progressEvent.loaded;
                const percent = Math.round((loaded / total) * 100);
                toast.loading(
                    toastElement(
                        notifTitle,
                        `${percent}% Downloaded`,
                        <MdCancel size={20} />,
                        () => {
                            console.log("canceled");
                            source.cancel("Download canceled by user");
                        }
                    ),
                    {
                        id: notifId,
                    }
                );
            },
        });

        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = notifTitle;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success(
            toastElement(
                notifTitle,
                `Download Completed`,
                <RxCross1 size={15} />,
                () => {
                    toast.dismiss(notifId);
                }
            ),
            {
                id: notifId,
            }
        );
    } catch (error) {
        console.error("Error downloading file:", error);
        toast.error(toastElement(notifTitle, "Canceled"), {
            id: notifId,
            duration: 2000,
        });
    }
};

export const convertTo = async (sourceFile, name, targetFormat, host) => {
    const iconSize = 20;
    const toastId = toastElement(name, "Uploading");
    try {
        const response = await axios.get(sourceFile, { responseType: "blob" });
        const formData = new FormData();
        formData.append("file", response.data, name);
        formData.append("format", targetFormat);
        formData.append("name", name);

        const controller = new AbortController();

        const cancelAxios = () => {
            controller.abort();
            toast.error(toastElement(name, "Canceled"), {
                id: toastId,
                duration: 2000,
            });
        };

        const config = {
            signal: controller.signal,
            onUploadProgress: () => {
                toast.loading(
                    toastElement(
                        name,
                        "Uploading",
                        <MdCancel size={iconSize} />,
                        cancelAxios
                    ),
                    {
                        id: toastId,
                        duration: Infinity,
                    }
                );
            },
        };

        const { data } = await axios.post(`${host}/convert`, formData, config);

        const downloadLink = host + data.downloadUrl;
        console.log(downloadLink);
        toast.success(
            toastElement(
                name,
                "Completed",
                <IoCloudDownload size={iconSize} />,
                () => {
                    downloadFile(downloadLink, toastId, name);
                }
            ),
            {
                id: toastId,
                duration: 20000,
            }
        );
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
            return;
        }

        toast.error(
            toastElement(
                name,
                "Upload Failed",
                <RxCross1 size={iconSize * 0.75} />,
                () => {
                    toast.dismiss(toastId);
                }
            ),
            {
                id: toastId,
            }
        );
    }
};
