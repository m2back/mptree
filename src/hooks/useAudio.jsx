import { useEffect, useState } from "react";

export default function useAudio() {
    const audio = new Audio();





    //Creating Function To Create a list of Songs with Lyric from files

    // Player Controls



    return {

        playSongById,
        play,
        pause,
        toggleRepeat,
        //NEW
        currentSong,
        isPlaying,
        togglePlayPause,
        musicTime: currentTime,
        duration,
        playlist,
        setTime,
        activeLyricIndex,
        //NEW
    };
}
