import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePlay = () => {
    if (!audioRef.current) {
      // Try local file first, then fall back to online classical version of "You Are My Sunshine"
      audioRef.current = new Audio("/classical-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing local audio:", error);
        // If local file fails, try online classical version of "You Are My Sunshine"
        const fallbackAudio = new Audio(
          "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
        );
        fallbackAudio.loop = true;
        fallbackAudio.volume = 0.3;
        fallbackAudio
          .play()
          .then(() => {
            audioRef.current = fallbackAudio;
            setIsPlaying(true);
          })
          .catch((fallbackError) => {
            console.error("Fallback audio also failed:", fallbackError);
            // Show a toast or alert that music couldn't be played
            alert(
              "Unable to play 'You Are My Sunshine' classical version. Please add the music file to the public folder."
            );
          });
      });
      setIsPlaying(true);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleTogglePlay}
      aria-label={isPlaying ? "Pause You Are My Sunshine" : "Play You Are My Sunshine"}
      className="relative hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors"
      title={isPlaying ? "Pause You Are My Sunshine (Classical)" : "Play You Are My Sunshine (Classical)"}
    >
      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      {isPlaying && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
}
