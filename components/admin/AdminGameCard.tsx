// c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\components\admin\AdminGameCard.tsx
"use client";

import type { Game } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import { supabase } from '@/lib/supabaseClient'; // supabase is not used in this component directly for delete

interface AdminGameCardProps {
  game: Game;
  onGameDeleted?: (gameId: string) => void;
}

export default function AdminGameCard({ game, onGameDeleted }: AdminGameCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the game "${game.title}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/games/${game.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete game');
      }

      if (onGameDeleted) {
        onGameDeleted(game.id);
      } else {
        router.refresh(); // Re-fetches server components, simpler for this case
      }
      // Optionally show a success message

    } catch (err: any) {
      console.error("Error deleting game:", err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group rounded-lg overflow-hidden shadow-lg relative">
      <Link href={`/games/${game.id}`} className="block"> {/* Main card link to public game page */}
        {/* Temporarily remove aspect ratio classes and add a fixed height for testing */}
        <div
          className="relative bg-gray-200" // Added a background color to see it
          style={{ height: '200px' }} // Added a fixed height
        >
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">No Image</div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
            <h3 className="text-white text-sm font-semibold truncate group-hover:underline" title={game.title}>{game.title}</h3>
          </div>
        </div>
      </Link>
      {/* Action buttons container */}
      <div className="absolute top-2 right-2 z-10 flex space-x-1">
        <Link
          href={`/admin/games/edit/${game.id}`} // Link to the admin edit page
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded shadow-md"
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded shadow-md disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 p-2">{error}</p>}
    </div>
  );
}
