"use client";

import React, { useState, useEffect } from 'react';
import type { Game } from '@/lib/types';
import Link from 'next/link'; // Import Link for the "Back to Games" button in proof submission

interface GamePlayerClientProps {
  game: Game;
}

const GamePlayerClient: React.FC<GamePlayerClientProps> = ({ game }) => {
  const [showPreGameAd, setShowPreGameAd] = useState(true);
  const [gameIframeSrc, setGameIframeSrc] = useState<string | null>(null);
  const [preGameAdSkippedOrCompleted, setPreGameAdSkippedOrCompleted] = useState(false);
  const [gameSessionActive, setGameSessionActive] = useState(false);
  const [showPostGameAd, setShowPostGameAd] = useState(false);
  const [postGameAdSkippedOrCompleted, setPostGameAdSkippedOrCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds for free play
  const [showProofSubmission, setShowProofSubmission] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const [isAwardingReward, setIsAwardingReward] = useState(false);

  // Sub-component to handle Pre-Game Ad Display Logic
  const PreGameAdDisplay = () => {
    const [adError, setAdError] = useState(false);
    const [adStatusMessage, setAdStatusMessage] = useState("Loading pre-game ad...");

    useEffect(() => {
      if (typeof (window as any).show_9431679 === 'function') {
        setAdStatusMessage("Showing pre-game advertisement...");
        (window as any).show_9431679('pop').then(() => { // Assuming 'pop' is for pre-game
          console.log("Monetag pre-game ad completed or closed by user.");
          setShowPreGameAd(false);
          setPreGameAdSkippedOrCompleted(true);
        }).catch((e: any) => {
          console.error("Monetag pre-game ad error:", e);
          setAdStatusMessage("Pre-game ad could not be loaded. You can proceed to the game.");
          setAdError(true);
        });
      } else {
        console.error("Monetag function show_9431679 not found. Ensure Monetag SDK script is loaded.");
        setAdStatusMessage("Ad system not available for pre-game ad. Please ensure Monetag SDK is loaded.");
        setAdError(true);
      }
    }, []);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700 text-white p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Advertisement</h2>
        <p className={`mb-6 ${adError ? 'text-red-400' : ''}`}>{adStatusMessage}</p>
        {adError && (
          <button
            onClick={() => {
              setShowPreGameAd(false);
              setPreGameAdSkippedOrCompleted(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors mt-4"
          >
            Proceed to Game
          </button>
        )}
      </div>
    );
  };

  // Sub-component for Post-Game Ad
  const PostGameAdDisplay = () => {
    const [adError, setAdError] = useState(false);
    const [adStatusMessage, setAdStatusMessage] = useState("Loading post-game ad...");

    useEffect(() => {
      if (typeof (window as any).show_9431679 === 'function') {
        setAdStatusMessage("Showing post-game advertisement...");
        (window as any).show_9431679().then(() => { // Calling without 'pop' for interstitial
            console.log("Monetag post-game ad (interstitial) completed or closed by user.");
            // alert('You have seen an ad!'); // Monetag's example
            setShowPostGameAd(false);
            setPostGameAdSkippedOrCompleted(true); // Signal to move to proof submission
        }).catch((e: any) => {
            console.error("Monetag post-game ad error:", e);
            setAdStatusMessage("Post-game ad could not be loaded. You can still continue.");
            setAdError(true);
        });
      } else {
        console.error("Monetag function show_9431679 not found for post-game ad.");
        setAdStatusMessage("Ad system not available for post-game ad.");
        setAdError(true);
      }
    }, []);

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700 text-white p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Advertisement</h2>
        <p className={`mb-6 ${adError ? 'text-red-400' : ''}`}>{adStatusMessage}</p>
        {(adError || !adStatusMessage.includes("Showing")) && (
          <button
            onClick={() => {
                setShowPostGameAd(false);
                setPostGameAdSkippedOrCompleted(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors mt-4"
          >
            Continue
          </button>
        )}
      </div>
    );
  };

  // Effect to load game iframe after pre-game ad
  useEffect(() => {
    if (preGameAdSkippedOrCompleted && !gameSessionActive) { // Ensure it only runs once to start session
      console.log("Pre-game ad skipped or completed, attempting to load game.");
      const parser = new DOMParser();
      const doc = parser.parseFromString(game.embedCode, "text/html");
      const iframeElement = doc.querySelector('iframe');

      if (iframeElement && iframeElement.src) {
        setGameIframeSrc(iframeElement.src);
        setGameSessionActive(true);
        setTimeLeft(60); // Reset timer for the game session to 1 minute
      } else {
        console.warn("Could not parse iframe src from embedCode. Game might not load.");
        setGameIframeSrc('ERROR_PARSING_EMBED');
      }
    }
  }, [preGameAdSkippedOrCompleted, game.embedCode, gameSessionActive]);

  // Timer logic
  useEffect(() => {
    if (!gameSessionActive || timeLeft <= 0) {
      if (gameSessionActive && timeLeft <= 0) { // Timer ran out
        console.log("Game session timer ended.");
        setGameSessionActive(false); // End game session
        setGameIframeSrc(null); // Clear iframe src to "remove" the game
        setShowPostGameAd(true);   // Trigger post-game ad
      }
      return; // Exit if session not active or timer already zero
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval
  }, [gameSessionActive, timeLeft]);
  
  const handleDonePlaying = () => {
    console.log("User clicked 'I'm Done Playing'.");
    setGameSessionActive(false); // End game session
    setGameIframeSrc(null);      // Clear iframe src to hide the game
    setTimeLeft(0);              // Set timeLeft to 0 to trigger the same logic as timer ending
    // The useEffect watching timeLeft will then set setShowPostGameAd(true)
  };

  const handleAwardFreePlayReward = async () => {
    setIsAwardingReward(true);
    setRewardMessage("Processing your reward...");

    let userId: string | number | undefined;
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      userId = window.Telegram.WebApp.initDataUnsafe?.user?.id;
    }

    if (!userId && process.env.NODE_ENV === 'development') {
        console.warn("Telegram User ID not found, using placeholder '6734895836' for free game reward testing.");
        userId = '6734895836'; // Align with TaskCardClient.tsx dev placeholder or ensure this user exists
    }

    if (!userId) {
      setRewardMessage("Error: Could not identify user to award reward.");
      setIsAwardingReward(false);
      return;
    }

    try {
      // console.log(`Simulating API call to award ₦${game.rewardAmount || 3} to user ${userId} for game ${game.id}`);
      // Simulate API delay
      // await new Promise(resolve => setTimeout(resolve, 1500)); 
      const response = await fetch('/api/games/award-free-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: String(userId), gameId: game.id, rewardAmount: game.rewardAmount || 3 }),
      });
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = `API Error: ${response.status}`;
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = `Server Error: ${response.status}. Response: ${errorText.substring(0, 300)}...`; // Show a snippet of non-JSON response
        }
        throw new Error(errorMessage);
      }
      // const result = await response.json(); // You might not need to parse a result if it's just a success message
      setRewardMessage(`Congratulations! You've earned ₦${game.rewardAmount || 3}.`);
    } catch (error) {
      console.error("Error awarding free play reward:", error);
      if (error instanceof Error) {
        setRewardMessage(`Error: ${error.message}`);
      } else {
        setRewardMessage("Sorry, an unknown error occurred while processing your reward.");
      }
    } finally {
      setIsAwardingReward(false);
    }
  };

  // Effect to move to proof submission after post-game ad
  useEffect(() => {
    if (postGameAdSkippedOrCompleted) {
        if (game.type === 'free') {
          handleAwardFreePlayReward();
        } else if (game.type === 'paid') {
          setShowProofSubmission(true); // For paid games, proceed to proof submission
        }
    }
  }, [postGameAdSkippedOrCompleted, game.type]); // Added game.type dependency


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Render logic based on state
  if (showPreGameAd) {
    return <PreGameAdDisplay />;
  }

  if (showPostGameAd) {
    return <PostGameAdDisplay />;
  }

  if (rewardMessage) { // Display reward message for free games after post-game ad
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-600 text-white p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <p className={`mb-6 text-center ${rewardMessage.includes("Error") || rewardMessage.includes("Sorry") ? 'text-red-300' : 'text-green-300'}`}>
            {isAwardingReward ? "Processing..." : rewardMessage}
        </p>
        {!isAwardingReward && (
            <Link href="/games" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Back to Games
            </Link>
        )}
      </div>
    );
  }

  // This will now only be shown for 'paid' games after the post-game ad
  if (showProofSubmission) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-600 text-white p-4 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Submit Proof</h2>
        <p className="mb-6">Upload a screenshot of your game result to earn ₦{game.rewardAmount || 3}.</p>
        <button
          onClick={() => console.log("Proof submission clicked (placeholder)")}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors mt-4"
        >
          Submit Screenshot (Placeholder)
        </button>
         <Link href="/games" className="mt-6 text-sm text-orange-300 hover:text-orange-200">
            Or Back to Games
        </Link>
      </div>
    );
  }

  if (gameIframeSrc === 'ERROR_PARSING_EMBED') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white p-4 rounded-lg">
        <p>Could not load game: Invalid embed code format.</p>
      </div>
    );
  }
  
  if (gameIframeSrc && gameSessionActive) {
    return (
      <>
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
          <span className="bg-black bg-opacity-75 text-white text-sm font-bold p-2 rounded">
            Time Left: {formatTime(timeLeft)}
          </span>
          <button
            onClick={handleDonePlaying}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 text-sm rounded-md shadow-sm transition-colors"
          >
            End Game
          </button>
        </div>
        <iframe
          src={gameIframeSrc}
          className="w-full h-full"
          frameBorder="0"
          allow="fullscreen; autoplay; encrypted-media"
          allowFullScreen
          title={game.title || "Game"}
        />
      </>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white p-4 rounded-lg">
      <p>Preparing game...</p>
    </div>
  );
};

export default GamePlayerClient;
