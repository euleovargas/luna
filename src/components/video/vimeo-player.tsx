'use client';

import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';
import { Card } from '@/components/ui/card';

interface VimeoPlayerProps {
  videoId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export function VimeoPlayer({ videoId, onProgress, onComplete }: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (!playerRef.current) return;

    const vimeoPlayer = new Player(playerRef.current, {
      id: videoId,
      width: 640,
      height: 360,
    });

    setPlayer(vimeoPlayer);

    // Eventos do player
    vimeoPlayer.on('timeupdate', ({ percent }) => {
      onProgress?.(percent * 100);
    });

    vimeoPlayer.on('ended', () => {
      onComplete?.();
    });

    return () => {
      vimeoPlayer.destroy();
    };
  }, [videoId]);

  return (
    <Card className="w-full aspect-video">
      <div ref={playerRef} className="w-full h-full" />
    </Card>
  );
}
