"use client";

import React from 'react';
import Link from 'next/link';
import type { Game } from '@/lib/types'; // Ensure this path is correct

interface GameCardProps {
  game: Game;
}

const GameCardClient: React.FC<GameCardProps> = ({ game }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 flex flex-col justify-between relative transition-all hover:shadow-xl">
      {game.imageUrl ? (
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-40 object-cover rounded-lg mb-4" // Increased bottom margin
        />
      ) : (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-lg mb-4 text-gray-500">
          No Image
        </div>
      )}

      <div className="flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate" title={game.title}>{game.title}</h3>
        <p className="text-sm text-gray-600 mb-2 h-10 overflow-hidden text-ellipsis">
          {game.description || "No description available."}
        </p>
        <p className="text-xs text-gray-500 mb-1">Type: <span className="capitalize font-medium text-gray-700">{game.type}</span></p>
        {game.type === 'free' && game.rewardAmount != null && ( // Check for null/undefined explicitly
          <p className="font-medium text-green-600 mb-3">Reward: ₦{game.rewardAmount}</p>
        )}
         {game.type === 'paid' && game.minBet != null && ( // Check for null/undefined explicitly
          <p className="font-medium text-blue-600 mb-3">Min Bet: ₦{game.minBet}</p>
        )}
      </div>

      <div className="mt-auto pt-3"> {/* Added padding-top for spacing */}
        <Link
          href={`/games/${game.id}`} // Link to the dynamic game embed page
          className="block w-full text-center bg-admin-sidebar hover:bg-gray-800 text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50"
        >
          {game.type === 'paid' ? 'Play & Bet' : 'Play Free'}
        </Link>
      </div>
    </div>
  );
};

export default GameCardClient;