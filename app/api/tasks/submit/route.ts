// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\api\tasks\submit\route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { PlatformTask, FirestoreUser, UserTaskSubmission } from '@/lib/types';

const ADMIN_APP_NAME_SUBMIT_API = 'TASKPLAY_SUBMIT_API_APP_V4'; // Using V4 to ensure a fresh attempt if needed
const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let adminAppInstance: App | undefined;

if (!serviceAccountKeyPath) {
  console.error("CRITICAL: GOOGLE_APPLICATION_CREDENTIALS env var is not set for task submission API.");
} else {
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME_SUBMIT_API);
  if (existingApp) {
    adminAppInstance = existingApp;
    console.log(`[API Submit] Firebase Admin SDK using existing app instance "${ADMIN_APP_NAME_SUBMIT_API}".`);
  } else {
    try {
      const resolvedPath = path.resolve(serviceAccountKeyPath);
      const serviceAccountJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      adminAppInstance = initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        projectId: serviceAccountJson.project_id, // Explicitly set projectId
      }, ADMIN_APP_NAME_SUBMIT_API);
      console.log(`[API Submit] Firebase Admin SDK initialized (App: ${ADMIN_APP_NAME_SUBMIT_API}).`);
    } catch (error: any) {
      console.error(`[API Submit] Firebase Admin SDK (App: ${ADMIN_APP_NAME_SUBMIT_API}) initialization error:`, error.message, error.stack);
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("[API Submit] POST request received at /api/tasks/submit"); // Add this log

  if (!adminAppInstance) {
    console.error("[API Submit] Firebase Admin App not initialized. Cannot process submission.");
    return NextResponse.json({ error: 'Server configuration error, Firebase not initialized.' }, { status: 500 });
  }
  if (!adminAppInstance.options?.projectId){
    console.error("[API Submit] Firebase Admin App initialized, but projectId is missing. Cannot process submission.");
    return NextResponse.json({ error: 'Server configuration error, Firebase projectId missing.' }, { status: 500 });
  }

  const db = getFirestore(adminAppInstance);

  try {
    const body = await request.json();
    console.log("[API Submit] Request body:", body); // Log the received body
    const { platformTaskId, userId: userIdString, proofUrl } = body;

    if (!platformTaskId || !userIdString) {
      console.log("[API Submit] Missing platformTaskId or userId in request body.");
      return NextResponse.json({ error: 'Missing platformTaskId or userId' }, { status: 400 });
    }

    const userId = parseInt(userIdString);
    if (isNaN(userId)) {
        console.log(`[API Submit] Invalid userId format: ${userIdString}`);
        return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    const taskDocRef = db.collection('platformTasks').doc(platformTaskId);
    const taskDoc = await taskDocRef.get();

    if (!taskDoc.exists) {
      console.log(`[API Submit] Task not found for platformTaskId: ${platformTaskId}`);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const platformTask = taskDoc.data() as PlatformTask;

    const userDocRef = db.collection('users').doc(String(userId));
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.log(`[API Submit] User not found for userId: ${userId}`);
      return NextResponse.json({ error: 'User not found. Please /start the bot first.' }, { status: 404 });
    }
    
    let rewardApplied = false;
    let submissionStatusDb: UserTaskSubmission['status'] = 'pending_approval';
    let responseMessage = 'Task submitted for review.';
    let currentBalance = (userDoc.data() as FirestoreUser)?.balance || 0;
    
    const autoApproveTaskTypes = ['joinTelegram']; 

    if (autoApproveTaskTypes.includes(platformTask.taskType)) {
      await userDocRef.update({
        balance: FieldValue.increment(platformTask.rewardAmount)
      });
      rewardApplied = true;
      submissionStatusDb = 'approved';
      currentBalance += platformTask.rewardAmount;
      responseMessage = `Task approved! ₦${platformTask.rewardAmount} added to your balance.`;
      console.log(`[API Submit] User ${userId} completed task ${platformTaskId} (${platformTask.taskType}) and earned ₦${platformTask.rewardAmount}`);
    } else {
      console.log(`[API Submit] User ${userId} submitted task ${platformTaskId} (${platformTask.taskType}) for manual review.`);
    }

    const submissionData: UserTaskSubmission = {
      userId: userId,
      platformTaskId: platformTaskId,
      submittedAt: new Date(), 
      status: submissionStatusDb,
      rewardApplied: rewardApplied,
      ...(proofUrl && { proofUrl: proofUrl }) 
    };
    const submissionRef = await db.collection('userTaskSubmissions').add(submissionData);
    console.log(`[API Submit] Submission logged with ID ${submissionRef.id} for user ${userId}, task ${platformTaskId}, status ${submissionStatusDb}`);

    return NextResponse.json({ message: responseMessage, newBalance: currentBalance }, { status: 200 });

  } catch (error: any) {
    console.error('[API Submit] Error processing task submission:', error);
    return NextResponse.json({ error: 'Failed to process task submission', details: error.message }, { status: 500 });
  }
}
