import { useEffect, useState } from "react";
import * as player from "./Player";

export default function MusicEntery({ cover, id, title, artist, album }) {
  const CurrentSongId = player.getCurrentSongId();
  const [active, setActive] = useState(CurrentSongId === id);
  
  useEffect(() => {
    player.audio.addEventListener("loadedmetadata", () => {
      setActive(player.getCurrentSongId() === id);
    });
  }, []);

  return (
    <>
      <div
        className="entry-container button"
        style={{
          backgroundColor: active && "rgb(43, 43, 45)",
          border: active ? "solid #772b2b 1px" : "solid transparent 1px",
          transition: active && "all 0.2s ease-in-out 0s",
        }}
        onClick={() => {
          player.playSongById(id);
        }}
      >
        <div className="entry-cover">
          <img src={cover} alt="Mini Cover" className="entry-cover-image" />
        </div>
        <div className="entry-details">
          <span className="entry-title">{title}</span>
          <br />
          <span className="entry-artist">{artist}</span>
          <span> • </span>
          <span className="entry-album">{album}</span>
        </div>
      </div>
    </>
  );
}
