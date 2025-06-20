import * as admin from 'firebase-admin'; // Namespaced import
import fs from 'fs';
import Link from 'next/link';
import AdminGameCard from '@/components/admin/AdminGameCard'; // Import the new client component

// --- Firebase Admin SDK Initialization ---
let serviceAccount: any;
const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
    console.log("[DashboardPage] Loaded Firebase service account from JSON_STRING.");
  } catch (e) {
    console.error("[DashboardPage] Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING:", e);
  }
} else if (serviceAccountPath) {
  console.log(`[DashboardPage] Attempting to load Firebase service account from path: ${serviceAccountPath}`);
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
    console.log("[DashboardPage] Successfully loaded and parsed Firebase service account from path.");
  } catch (e) {
    console.error("[DashboardPage] Failed to load or parse Firebase service account from path:", e);
  }
} else {
  console.warn("[DashboardPage] Firebase Admin SDK credentials not found. Some features might not work.");
}

import type { Game } from '@/lib/types'; // Ensure this type is correctly defined

async function getDashboardGames(): Promise<Game[]> {
  let adminApp: admin.app.App | undefined; // App instance within this scope
  const adminAppName = 'TASKPLAY_DASHBOARD_APP';

  try {
    // Check if an app with this name already exists
    if (!admin.apps.find(app => app?.name === adminAppName) && serviceAccount) {
      console.log(`[DashboardPage getDashboardGames] Initializing Firebase Admin App: ${adminAppName}`);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, adminAppName);
    } else {
      adminApp = admin.apps.find(app => app?.name === adminAppName);
      console.log(`[DashboardPage getDashboardGames] Using existing Firebase Admin App: ${adminAppName}`);
    }

    if (!adminApp) {
      throw new Error("Firebase Admin app not initialized.");
    }

    const db = admin.firestore(adminApp); // Get Firestore instance
    const gamesCollection = db.collection('games');
    const gamesSnapshot = await gamesCollection.orderBy('createdAt', 'desc').get();
    const gamesList = gamesSnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : null;

        return {
          id: doc.id,
          ...data,
          createdAt,
        } as Game;
    }) as Game[]; // Type assertion
    console.log(`[DashboardPage getDashboardGames] Fetched ${gamesList.length} games.`);
    return gamesList;
  } catch (error: any) { // Explicit 'any' type for error
      return [];
  }
  }

const AdminDashboardPage = async () => {
  const games = await getDashboardGames();
  const activeGamesCount = games.filter(game => game.status === 'active').length;
  const freeGames = games.filter(game => game.type === 'free');
  const paidGames = games.filter(game => game.type === 'paid');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <AdminSidebar /> */} {/* Placeholder for your sidebar */}
      <div className="flex-1 p-6 md:p-8 lg:p-10">
        {/* <AdminHeader title="Admin Dashboard" /> */} {/* Placeholder for your header */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">Total Games</h2>
            <p className="text-3xl font-bold text-indigo-600">{games.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">Active Games</h2>
            <p className="text-3xl font-bold text-green-600">{activeGamesCount}</p>
          </div>
          {/* Add more summary cards here (e.g., Total Users, Pending Approvals) */}
        </div>

        {/* Free Games Section */}
        {freeGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Free Games ({freeGames.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {freeGames.map(game => (
                <AdminGameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Paid Games Section */}
        {paidGames.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Bet-to-Play Games ({paidGames.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {paidGames.map(game => (
                <AdminGameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

    {(freeGames.length === 0 && paidGames.length === 0) && (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No games found in the database.</p>
      </div>
    )}

        {/* <div className="bg-white p-6 rounded-lg shadow-md min-h-[300px]">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Main Content / Overview</h2>
          <p className="text-gray-600">This area can be used for charts, recent activity, or a featured image.</p>
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboardPage;