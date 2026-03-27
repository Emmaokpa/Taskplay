"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Gamepad2, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Game {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  category?: string;
  tags?: string[];
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filtered, setFiltered] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/games.json')
      .then((r) => r.json())
      .then((data) => {
        // Support both a top-level array or { games: [...] }
        const list: Game[] = Array.isArray(data) ? data : (data.games ?? []);
        setGames(list);
        setFiltered(list);

        const cats = ['All', ...Array.from(new Set(list.map((g) => g.category || 'Other').filter(Boolean))) as string[]];
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = games;
    if (activeCategory !== 'All') {
      result = result.filter((g) => (g.category || 'Other') === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.title.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [search, activeCategory, games]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-36 px-4 sm:px-6 md:px-10 pt-6">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Gamepad2 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Games</h1>
        </div>
        <p className="text-white/40 text-sm">Play for fun. No cost. No limits.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-2xl pl-11 pr-5 py-4 text-white text-sm placeholder-white/20 outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white/[0.05] text-white/40 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/[0.04] rounded-3xl aspect-[4/5] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Gamepad2 className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white/30 text-sm font-medium">No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link href={`/games/${encodeURIComponent(game.id)}`}>
                <div className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] rounded-3xl overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-square bg-[#1a1a2e]">
                    {game.thumbnail ? (
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 className="w-10 h-10 text-white/10" />
                      </div>
                    )}
                    {/* Category pill overlay */}
                    {game.category && (
                      <span className="absolute top-2 left-2 bg-black/60 text-white/60 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {game.category}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-white text-xs font-bold truncate leading-tight mb-1">{game.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white/30 text-[10px] font-medium">Free</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
