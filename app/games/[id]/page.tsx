"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Maximize2, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Game {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  category?: string;
}

export default function GamePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const gameId = decodeURIComponent(params.id as string);

  useEffect(() => {
    fetch('/games.json')
      .then((r) => r.json())
      .then((data) => {
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.segments && Array.isArray(data.segments)) {
          data.segments.forEach((seg: any) => {
            if (seg.hits && Array.isArray(seg.hits)) {
              list = [...list, ...seg.hits];
            }
          });
        } else if (data.games) {
          list = data.games;
        }
        
        const found = list.find((g: any) => String(g.id) === gameId);
        if (found) {
          setGame({
            id: found.id,
            title: found.title,
            description: found.description,
            thumbnail: found.thumbnail || (found.images && found.images[0]) || '',
            url: found.gameURL || found.url || '',
            category: found.category || (found.genres && found.genres[0]) || ''
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [gameId]);

  // Auto-hide controls after 4 seconds of inactivity in fullscreen
  const resetControlTimer = () => {
    if (!isFullscreen) return;
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  };

  useEffect(() => {
    if (isFullscreen) {
      resetControlTimer();
    } else {
      setShowControls(true);
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    }
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setIframeLoaded(false);
    setTimeout(() => setIframeLoaded(true), 100);
  };

  const reloadGame = () => {
    setIframeLoaded(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-white/30 text-sm">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4">
        <p className="text-white/40 text-sm">Game not found.</p>
        <button onClick={() => router.push('/games')} className="text-indigo-400 text-sm font-bold">
          ← Back to Games
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#0f0f0f] ${isFullscreen ? 'fixed inset-0 z-[200]' : 'min-h-screen'} flex flex-col`}
      onMouseMove={resetControlTimer}
      onTouchStart={resetControlTimer}
    >
      {/* Top Bar */}
      <AnimatePresence>
        {(!isFullscreen || showControls) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 px-4 py-3 bg-[#0f0f0f] border-b border-white/[0.05] z-10 ${isFullscreen ? 'absolute top-0 left-0 right-0' : ''}`}
          >
            <button
              onClick={() => isFullscreen ? setIsFullscreen(false) : router.push('/games')}
              className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center transition-all active:scale-90"
            >
              {isFullscreen ? <X className="w-4 h-4 text-white/70" /> : <ArrowLeft className="w-4 h-4 text-white/70" />}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{game.title}</p>
              {game.category && (
                <p className="text-white/30 text-[10px] font-medium uppercase tracking-wide">{game.category}</p>
              )}
            </div>

            <button
              onClick={reloadGame}
              className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center transition-all active:scale-90"
            >
              <RotateCcw className="w-4 h-4 text-white/50" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/20 flex items-center justify-center transition-all active:scale-90"
            >
              <Maximize2 className="w-4 h-4 text-indigo-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Frame Container */}
      <div className={`flex-1 relative ${isFullscreen ? 'pt-0' : ''}`}>
        {/* Loading shimmer while iframe loads */}
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-[#0f0f0f]">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <p className="text-white/20 text-xs font-medium">Starting {game.title}...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={game.url}
          title={game.title}
          className={`w-full h-full border-0 transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ minHeight: isFullscreen ? '100vh' : 'calc(100vh - 57px)' }}
          allow="fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
    </div>
  );
}
