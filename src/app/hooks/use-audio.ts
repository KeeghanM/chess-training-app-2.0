import { useRef } from 'react';

export const useAudio = (src: string) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));

  const play = () => {
    audioRef.current.play().catch(() => {
      // do nothing, but this makes esLint happy :)
    });
  };

  return play;
};
