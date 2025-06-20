"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import the Supabase client
import type { Game } from '@/lib/types'; // Make sure this path is correct

const CreateGamePage = () => {
  const [gameDetails, setGameDetails] = useState<Partial<Game>>({
    title: '',
    description: '',
    embedCode: '',
    gamePlatform: '',
    category: '',
    type: 'free', // Default to free
    status: 'active', // Default to active
    rewardAmount: 0,
    minBet: 50, // Default min bet
    maxBet: 5000, // Default max bet
    winMultiplier: 1.5, // Default win multiplier
    imageUrl: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGameDetails(prev => ({
      ...prev,
      [name]: name === 'rewardAmount' || name === 'minBet' || name === 'maxBet' || name === 'winMultiplier'
        ? parseFloat(value) || 0 // Ensure numeric fields are parsed
        : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Clear previous imageUrl if a new file is selected
      setGameDetails(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    let finalImageUrl = gameDetails.imageUrl || '';

    if (selectedFile) {
      setUploadingImage(true);
      setMessage("Uploading image...");
      const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const bucketName = 'taskplay-game-images'; // Make sure this matches your Supabase bucket name

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, selectedFile, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false, // Don't overwrite if file with same name exists (optional)
        });

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

    if (!gameDetails.title || !gameDetails.embedCode) {
      setMessage('Error: Title and Embed Code are required.');
      setIsLoading(false);
      return;
    }

    // Prepare data for API, ensuring correct types for numeric fields
    const payload: Partial<Game> = {
      ...gameDetails,
      imageUrl: finalImageUrl, // Use the URL from Supabase or the manually entered one
      rewardAmount: gameDetails.type === 'free' ? Number(gameDetails.rewardAmount) : undefined,
      minBet: gameDetails.type === 'paid' ? Number(gameDetails.minBet) : undefined,
      maxBet: gameDetails.type === 'paid' ? Number(gameDetails.maxBet) : undefined,
      winMultiplier: gameDetails.type === 'paid' ? Number(gameDetails.winMultiplier) : undefined,
    };

    try {
      const response = await fetch('/api/admin/games/create', { // We'll create this API endpoint next
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create game');
      }
      setMessage(`Success: Game "${result.game.title}" created with ID: ${result.game.id}`);
      // Optionally reset form:
      setGameDetails({ title: '', description: '', embedCode: '', gamePlatform: '', category: '', type: 'free', status: 'active', rewardAmount: 0, minBet: 50, maxBet: 5000, winMultiplier: 1.5, imageUrl: '' });
      setSelectedFile(null);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Game</h1>
      {message && (
        <div className={`mb-4 p-4 rounded-md ${message.toLowerCase().includes('error') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
          <input type="text" name="title" id="title" value={gameDetails.title || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={gameDetails.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
        <div>
          <label htmlFor="embedCode" className="block text-sm font-medium text-gray-700">Embed Code (Full iframe/script tag) *</label>
          <textarea name="embedCode" id="embedCode" value={gameDetails.embedCode || ''} onChange={handleChange} rows={5} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder='<iframe src="..."></iframe>'></textarea>
        </div>
        <div>
          <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Game Image (for card display)</label>
          <input
            type="file"
            name="imageFile"
            id="imageFile"
            accept="image/png, image/jpeg, image/webp, image/gif"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {selectedFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name}</p>}
          {gameDetails.imageUrl && !selectedFile && (
            <p className="text-xs text-gray-500 mt-1">Current image URL: <a href={gameDetails.imageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{gameDetails.imageUrl.substring(0,50)}...</a></p>
          )}
          <p className="text-xs text-gray-500 mt-1">Alternatively, paste an image URL below (upload will take precedence):</p>
          <input type="url" name="imageUrl" id="imageUrl" placeholder="Or paste direct image URL here" value={gameDetails.imageUrl || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="gamePlatform" className="block text-sm font-medium text-gray-700">Game Platform (e.g., Spritted)</label>
          <input type="text" name="gamePlatform" id="gamePlatform" value={gameDetails.gamePlatform || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category (e.g., Puzzle)</label>
          <input type="text" name="category" id="category" value={gameDetails.category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Game Type *</label>
          <select name="type" id="type" value={gameDetails.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="free">Free (Ad-Monetized)</option>
            <option value="paid">Paid (Bet-to-Play)</option>
          </select>
        </div>
        {gameDetails.type === 'free' && (
          <div>
            <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700">Reward Amount (for Free Play, e.g., ₦3)</label>
            <input type="number" name="rewardAmount" id="rewardAmount" value={gameDetails.rewardAmount || 0} onChange={handleChange} step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        )}
        {gameDetails.type === 'paid' && (
          <>
            <div>
              <label htmlFor="minBet" className="block text-sm font-medium text-gray-700">Minimum Bet (e.g., ₦50)</label>
              <input type="number" name="minBet" id="minBet" value={gameDetails.minBet || 0} onChange={handleChange} step="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="maxBet" className="block text-sm font-medium text-gray-700">Maximum Bet (e.g., ₦5000)</label>
              <input type="number" name="maxBet" id="maxBet" value={gameDetails.maxBet || 0} onChange={handleChange} step="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="winMultiplier" className="block text-sm font-medium text-gray-700">Win Multiplier (e.g., 1.5 for 1.5x)</label>
              <input type="number" name="winMultiplier" id="winMultiplier" value={gameDetails.winMultiplier || 0} onChange={handleChange} step="0.1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </>
        )}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
          <select name="status" id="status" value={gameDetails.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <button type="submit" disabled={isLoading || uploadingImage} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {uploadingImage ? 'Uploading Image...' : (isLoading ? 'Creating Game...' : 'Create Game')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGamePage;