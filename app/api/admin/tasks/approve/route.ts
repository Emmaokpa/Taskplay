// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\api\admin\tasks\approve\route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { UserTaskSubmission, PlatformTask, FirestoreUser } from '@/lib/types';

const ADMIN_APP_NAME_APPROVE_API = 'TASKPLAY_APPROVE_API_APP_V2'; // Using V2 for a fresh check
const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let adminAppInstance: App | undefined;

if (!serviceAccountKeyPath) {
  console.error("CRITICAL: GOOGLE_APPLICATION_CREDENTIALS env var is not set for Approve Task API.");
} else {
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME_APPROVE_API);
  if (existingApp) {
    adminAppInstance = existingApp;
    console.log(`[API ApproveTask] Firebase Admin SDK using existing app instance "${ADMIN_APP_NAME_APPROVE_API}".`);
  } else {
    try {
      const resolvedPath = path.resolve(serviceAccountKeyPath);
      const serviceAccountJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      adminAppInstance = initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        projectId: serviceAccountJson.project_id, // Explicitly set projectId
      }, ADMIN_APP_NAME_APPROVE_API);
      console.log(`[API ApproveTask] Firebase Admin SDK initialized (App: ${ADMIN_APP_NAME_APPROVE_API}).`);
    } catch (error: any) {
      console.error(`[API ApproveTask] Firebase Admin SDK (App: ${ADMIN_APP_NAME_APPROVE_API}) initialization error:`, error.message, error.stack);
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("[API ApproveTask] POST request received at /api/admin/tasks/approve"); // Log entry

  if (!adminAppInstance) {
    console.error("[API ApproveTask] Firebase Admin App not initialized. Cannot process approval.");
    return NextResponse.json({ error: 'Server configuration error, Firebase not initialized.' }, { status: 500 });
  }
  if (!adminAppInstance.options?.projectId){
    console.error("[API ApproveTask] Firebase Admin App initialized, but projectId is missing. Cannot process approval.");
    return NextResponse.json({ error: 'Server configuration error, Firebase projectId missing.' }, { status: 500 });
  }

  const db = getFirestore(adminAppInstance);

  try {
    const { submissionId } = await request.json();
    console.log(`[API ApproveTask] Received submissionId: ${submissionId}`);

    if (!submissionId || typeof submissionId !== 'string') {
      console.log("[API ApproveTask] Missing or invalid submissionId.");
      return NextResponse.json({ error: 'Missing or invalid submissionId' }, { status: 400 });
    }

    const submissionRef = db.collection('userTaskSubmissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      console.log(`[API ApproveTask] Submission not found: ${submissionId}`);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submissionData = submissionDoc.data() as UserTaskSubmission;

    if (submissionData.status !== 'pending_approval') {
      console.log(`[API ApproveTask] Submission ${submissionId} is not pending approval. Current status: ${submissionData.status}`);
      return NextResponse.json({ error: 'Task is not pending approval or already processed' }, { status: 400 });
    }

    if (!submissionData.platformTaskId) {
        console.error(`[API ApproveTask] Submission ${submissionId} is missing platformTaskId.`);
        return NextResponse.json({ error: 'Submission data is incomplete (missing platformTaskId)' }, { status: 500 });
    }
    const taskDocRef = db.collection('platformTasks').doc(submissionData.platformTaskId);
    const taskDoc = await taskDocRef.get();
    if (!taskDoc.exists) {
        console.error(`[API ApproveTask] Associated platform task ${submissionData.platformTaskId} not found for submission ${submissionId}.`);
        return NextResponse.json({ error: 'Associated platform task not found' }, { status: 404 });
    }
    const platformTask = taskDoc.data() as PlatformTask;

    if (!submissionData.userId) {
        console.error(`[API ApproveTask] Submission ${submissionId} is missing userId.`);
        return NextResponse.json({ error: 'Submission data is incomplete (missing userId)' }, { status: 500 });
    }
    const userRef = db.collection('users').doc(String(submissionData.userId));
    const userDoc = await userRef.get(); // Check if user exists

    if (userDoc.exists) {
        await userRef.update({
            balance: FieldValue.increment(platformTask.rewardAmount)
        });
        console.log(`[API ApproveTask] User ${submissionData.userId} balance updated by ${platformTask.rewardAmount}.`);
    } else {
        console.warn(`[API ApproveTask] User ${submissionData.userId} not found for submission ${submissionId}. Balance not updated, but task will be marked approved.`);
        // Decide if you want to proceed with marking task approved if user is not found or return an error.
        // For now, we'll proceed to mark the task submission as approved.
    }

    await submissionRef.update({
      status: 'approved',
      rewardApplied: true // Mark that the reward logic has been applied (or attempted)
    });

    console.log(`[API ApproveTask] Submission ${submissionId} approved for user ${submissionData.userId}. Reward: ${platformTask.rewardAmount}`);
    return NextResponse.json({ message: 'Task approved and reward applied successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('[API ApproveTask] Error approving task:', error);
    return NextResponse.json({ error: 'Failed to approve task', details: error.message }, { status: 500 });
  }
}