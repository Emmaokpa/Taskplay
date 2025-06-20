// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\api\admin\tasks\submissions\route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { UserTaskSubmission, PlatformTask, FirestoreUser } from '@/lib/types';

const ADMIN_APP_NAME_GET_SUBMISSIONS_API = 'TASKPLAY_GET_SUBMISSIONS_API_APP_V1';
const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let adminAppInstance: App | undefined;

if (!serviceAccountKeyPath) {
  console.error("CRITICAL: GOOGLE_APPLICATION_CREDENTIALS env var is not set for Get Submissions API.");
} else {
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME_GET_SUBMISSIONS_API);
  if (existingApp) {
    adminAppInstance = existingApp;
    // Optional: console.log(`[API GetSubmissions] Firebase Admin SDK using existing app instance "${ADMIN_APP_NAME_GET_SUBMISSIONS_API}".`);
  } else {
    try {
      const resolvedPath = path.resolve(serviceAccountKeyPath);
      const serviceAccountJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      adminAppInstance = initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        projectId: serviceAccountJson.project_id,
      }, ADMIN_APP_NAME_GET_SUBMISSIONS_API);
      console.log(`[API GetSubmissions] Firebase Admin SDK initialized (App: ${ADMIN_APP_NAME_GET_SUBMISSIONS_API}).`);
    } catch (error: any) {
      console.error(`[API GetSubmissions] Firebase Admin SDK (App: ${ADMIN_APP_NAME_GET_SUBMISSIONS_API}) init error:`, error.message);
    }
  }
}

interface EnrichedUserTaskSubmission extends UserTaskSubmission {
  taskTitle?: string;
  taskType?: string;
}

interface ReferralStat {
  userId: number;
  username?: string | null;
  referralCount: number;
}
export async function GET(request: NextRequest) {
  if (!adminAppInstance || !adminAppInstance.options?.projectId) {
    return NextResponse.json({ error: 'Server configuration error, Firebase not initialized or projectId missing.' }, { status: 500 });
  }

  const db = getFirestore(adminAppInstance);

  try {
    const submissionsSnapshot = await db.collection('userTaskSubmissions').orderBy('submittedAt', 'desc').get();
    
    // Get total users count
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Get referral stats
    const referrersSnapshot = await db.collection('users')
                                      .where('referralCount', '>', 0)
                                      .orderBy('referralCount', 'desc')
                                      .get();
    const referralStats: ReferralStat[] = referrersSnapshot.docs.map(doc => {
      const userData = doc.data() as FirestoreUser;
      return { userId: userData.id, username: userData.username, referralCount: userData.referralCount || 0 };
    });

    let totalEarnings = 0;

    const submissions: EnrichedUserTaskSubmission[] = [];
    for (const doc of submissionsSnapshot.docs) {
      const submissionData = doc.data() as UserTaskSubmission;

      // Convert Firestore Timestamp to JS Date for submittedAt
      if (submissionData.submittedAt && (submissionData.submittedAt as any).toDate) {
          submissionData.submittedAt = (submissionData.submittedAt as unknown as Timestamp).toDate();
      } else if (typeof submissionData.submittedAt === 'string') { // Fallback if it's a string
          submissionData.submittedAt = new Date(submissionData.submittedAt);
      }

      let taskTitle = 'N/A';
      let taskType = 'N/A';
      if (submissionData.platformTaskId) {
          const taskDoc = await db.collection('platformTasks').doc(submissionData.platformTaskId).get();
          if (taskDoc.exists) {
              const platformTaskData = taskDoc.data() as PlatformTask;
              taskTitle = platformTaskData.title;
              taskType = platformTaskData.taskType;
          }
      }

      // Calculate total earnings from approved and applied rewards
      if (submissionData.status === 'approved' && submissionData.rewardApplied && submissionData.platformTaskId) {
        // We need to fetch the task again to get its rewardAmount,
        // as it's not stored directly on the submission document.
        const taskDoc = await db.collection('platformTasks').doc(submissionData.platformTaskId).get();
        if (taskDoc.exists) {
            totalEarnings += (taskDoc.data() as PlatformTask).rewardAmount || 0;
        }
      }

      submissions.push({ id: doc.id, ...submissionData, taskTitle, taskType });
    }
    return NextResponse.json({ submissions, totalUsers, totalEarnings, referralStats }, { status: 200 });
  } catch (error: any) {
    console.error('[API GetSubmissions] Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions', details: error.message }, { status: 500 });
  }
}
