// types.ts
// This file will hold custom TypeScript types for our application.

// Assuming Firebase Admin SDK's Timestamp, or a generic one if not specific to admin
// If you are using firebase-admin/firestore
import { Timestamp as FirebaseAdminTimestamp } from 'firebase-admin/firestore';
// If you are using the client-side Firebase SDK (firebase/firestore)
// import { Timestamp as FirebaseClientTimestamp } from 'firebase/firestore';


export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string; // Optional
  username?: string;  // Optional
  language_code?: string; // Optional
}

export interface TelegramChat {
  id: number;
  first_name?: string; // Optional, present in private chats
  last_name?: string;  // Optional, present in private chats
  username?: string;   // Optional, present in private chats
  type: 'private' | 'group' | 'supergroup' | 'channel';
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser; // Optional, not present in channel posts
  chat: TelegramChat;
  date: number; // Unix timestamp
  text?: string; // Optional
  // We can add more fields as needed, e.g., entities, photo, etc.
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage; // Optional, other update types exist
  // We can add other update types like callback_query, inline_query etc.
}

export interface FirestoreUser {
  id: number; // Telegram chat ID
  firstName?: string;
  username?: string | null; // Can be null if not set
  joinedAt: Date;
  referralCode?: string; // Unique code for this user to refer others
  referredBy?: number;   // Telegram ID of the user who referred them
  referralCount?: number; // How many users they have referred
  balance?: number;       // User's earnings balance
  lastLoginBonusAt?: Date; // Timestamp of the last daily login bonus claim
  dailyFreeGamesPlayed?: number;
  lastFreeGamePlayDate?: string; // Store as "YYYY-MM-DD"
}

export type PlatformTaskType =
  | 'joinTelegram'
  | 'joinWhatsApp'
  | 'followInstagram'
  | 'followTikTok'
  | 'likeCommentPost'
  | 'subscribeYouTube'
  | 'downloadApp'
  | 'followTwitter'; // Added for X (Twitter)

export interface PlatformTask {
  id?: string; // Firestore document ID, will be populated after fetching
  title: string;
  description: string;
  taskType: PlatformTaskType;
  link: string; // URL for the task (e.g., t.me/channel_name)
  rewardAmount: number;
  status: 'active' | 'inactive';
  createdAt: Date; // Should be a JS Date object after fetching
  // Potentially: targetCount, currentCompletions, etc. for campaign tasks
}

export interface UserTaskSubmission {
  id?: string; // Firestore document ID
  userId: number; // Telegram User ID (or your web app's user ID)
  platformTaskId: string; // ID of the PlatformTask
  submittedAt: Date;
  status: 'pending_approval' | 'approved' | 'rejected';
  rewardApplied: boolean;
  proofUrl?: string; // Optional URL for the submitted proof (e.g., screenshot)
}

export interface Game {
  id: string; // Firestore document ID
  title: string;
  description: string;
  embedCode: string; // Full iframe HTML string or script tag
  gamePlatform?: string; // e.g., "Spritted", "GameMonetize", "HTML5"
  category?: string; // e.g., "Action", "Puzzle"
  type: 'free' | 'paid';
  rewardAmount?: number; // For free games (e.g., ₦3)
  minBet?: number; // For paid games (e.g., ₦50)
  maxBet?: number; // For paid games (e.g., ₦5000)
  winMultiplier?: number; // e.g., 1.5 for 1.5x payout on bet
  status: 'active' | 'inactive';
  createdAt: Date | FirebaseAdminTimestamp; // Allow both for client/server flexibility
  imageUrl?: string; // Optional URL for a game thumbnail/image
  isFeatured?: boolean; // To mark games as featured
}

export interface Task {
  id: string; // Document ID from Firestore
  title: string;
  description?: string;
  type: 'social_follow' | 'cpa_offer' | 'game_task' | string; // Add more specific types
  platform?: string; // e.g., instagram, tiktok, website
  link: string; // URL for the task (e.g., profile to follow, offer page)
  targetCount: number; // Desired number of actions/completions
  currentCount: number; // Current number of completions
  rewardPerAction: number; // Reward for one completion
  totalBudget?: number; // Optional: targetCount * rewardPerAction
  status: 'pending_payment' | 'active' | 'paused' | 'completed' | 'cancelled' | string;
  submittedBy_supabaseAuthUserId: string;
  submittedBy_telegramId?: number; // Optional
  createdAt: Date | FirebaseAdminTimestamp; // Store as Timestamp, convert to Date on fetch
  updatedAt: Date | FirebaseAdminTimestamp;
}
