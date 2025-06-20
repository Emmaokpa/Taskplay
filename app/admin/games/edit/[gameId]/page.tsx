"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Game } from '@/lib/types';

const EditGamePage = () => {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [gameDetails, setGameDetails] = useState<Partial<Game>>({
    title: '',
    description: '',
    embedCode: '',
    gamePlatform: '',
    category: '',
    type: 'free',
    status: 'active',
    rewardAmount: 0,
    minBet: 50,
    maxBet: 5000,
    winMultiplier: 1.5,
    imageUrl: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (gameId) {
      const fetchGameData = async () => {
        setIsFetching(true);
        setMessage("Loading game details...");
        try {
          // This API route needs to be created
          const response = await fetch(`/api/admin/games/${gameId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch game data');
          }
          const data: Game = await response.json();
          setGameDetails({
            ...data,
            rewardAmount: data.rewardAmount || 0,
            minBet: data.minBet || 50,
            maxBet: data.maxBet || 5000,
            winMultiplier: data.winMultiplier || 1.5,
          });
          setMessage(null);
        } catch (err: any) {
          setMessage(`Error loading game: ${err.message}`);
        } finally {
          setIsFetching(false);
        }
      };
      fetchGameData();
    }
  }, [gameId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGameDetails(prev => ({
      ...prev,
      [name]: name === 'rewardAmount' || name === 'minBet' || name === 'maxBet' || name === 'winMultiplier'
               ? parseFloat(value) || 0 // Ensure numeric conversion
               : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Optionally clear previous imageUrl if a new file is selected,
      // or let the backend handle replacing the image.
      // For now, we'll just set the selected file.
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    let finalImageUrl = gameDetails.imageUrl || '';

    if (selectedFile) {
      setUploadingImage(true);
      setMessage("Uploading new image...");
      const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const bucketName = 'taskplay-game-images'; // Ensure this matches your Supabase bucket

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile, { upsert: true }); // upsert: true might be useful if you want to overwrite with same name, or manage versions

      setUploadingImage(false);

      if (uploadError) {
        setMessage(`Error uploading image: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }
      if (uploadData) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(uploadData.path);
        finalImageUrl = urlData.publicUrl;
      }
    }

    const payload: Partial<Game> = {
      ...gameDetails,
      imageUrl: finalImageUrl,
      // Ensure numeric fields are numbers
      rewardAmount: gameDetails.type === 'free' ? Number(gameDetails.rewardAmount) : undefined,
      minBet: gameDetails.type === 'paid' ? Number(gameDetails.minBet) : undefined,
      maxBet: gameDetails.type === 'paid' ? Number(gameDetails.maxBet) : undefined,
      winMultiplier: gameDetails.type === 'paid' ? Number(gameDetails.winMultiplier) : undefined,
    };

    try {
      // This API route needs to be created/updated to handle PUT
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to update game');
      }
      setMessage('Success: Game updated!');
      // router.push('/dashboard'); // Optionally redirect after update
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="container mx-auto p-4 text-center">Loading game data...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Edit Game: {gameDetails.title || 'Loading...'}</h1>
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.startsWith('Error:') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
      {/* The form will be very similar to CreateGamePage, pre-filled with gameDetails */}
      {/* For brevity, I'm not repeating the full form structure here. */}
      {/* You would copy the <form> from CreateGamePage and ensure its inputs */}
      {/* are correctly bound to the `gameDetails` state and `handleChange` function. */}
      {/* Make sure the submit button text is "Update Game". */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Example field (copy all fields from CreateGamePage) */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" name="title" id="title" value={gameDetails.title || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* ... (COPY ALL OTHER FORM FIELDS FROM CreateGamePage HERE, ensuring they use `gameDetails.fieldName`) ... */}
        {/* Including description, embedCode, imageUrl (file and text input), gamePlatform, category, type, status, rewardAmount, minBet, maxBet, winMultiplier */}

        {/* Example for Image Upload (adapt from CreateGamePage) */}
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">New Game Image (Optional)</label>
          <input type="file" name="imageFile" id="imageFile" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          {selectedFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name}</p>}
          {gameDetails.imageUrl && !selectedFile && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Current Image:</p>
              <img src={gameDetails.imageUrl} alt="Current game" className="mt-1 max-w-xs h-auto rounded border" />
            </div>
          )}
        </div>

        <div>
          <button type="submit" disabled={isLoading || uploadingImage || isFetching} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {uploadingImage ? 'Uploading...' : (isLoading ? 'Updating...' : 'Update Game')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGamePage;