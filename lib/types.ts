
// Types and Interfaces for TaskPlay
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

export type TaskCategory = 'signup' | 'install' | 'review' | 'sale' | 'subscription' | 'social';

export interface FirestoreTask {
  id?: string;
  advertiserId: string;
  type: 'flat' | 'percentage';
  category: TaskCategory;
  title: string;
  description: string;
  instructions: string;
  actionUrl: string;
  totalBudget?: number; // For flat tasks: ₦100 * count
  userReward: number; // For flat: ₦50, For percentage: e.g. 0.10 (10%)
  platformComission: number; // For flat: ₦50, For percentage: e.g. 0.10 (10%)
  maxParticipations: number;
  currentParticipations: number;
  proofType: 'screenshot' | 'text' | 'both';
  status: 'active' | 'paused' | 'completed' | 'pending_payment';
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskSubmission {
  id?: string;
  taskId: string;
  userId: string;
  advertiserId: string;
  proofUrl: string; // ImageKit URL
  proofText?: string;
  status: 'pending' | 'approved' | 'rejected';
  rewardAmount: number; // Actual ₦ credited
  createdAt: Date;
  verifiedAt?: Date;
}

export interface UserWallet {
  uid: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  isMember: boolean;
  role: 'user' | 'admin' | 'advertiser';
}
