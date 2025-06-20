// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\api\admin\tasks\reject\route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { UserTaskSubmission } from '@/lib/types';

const ADMIN_APP_NAME_REJECT_API = 'TASKPLAY_REJECT_API_APP_V1'; // Unique name
const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let adminAppInstance: App | undefined;

if (!serviceAccountKeyPath) {
  console.error("CRITICAL: GOOGLE_APPLICATION_CREDENTIALS env var is not set for Reject Task API.");
} else {
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME_REJECT_API);
  if (existingApp) {
    adminAppInstance = existingApp;
    console.log(`[API RejectTask] Firebase Admin SDK using existing app instance "${ADMIN_APP_NAME_REJECT_API}".`);
  } else {
    try {
      const resolvedPath = path.resolve(serviceAccountKeyPath);
      const serviceAccountJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      adminAppInstance = initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        projectId: serviceAccountJson.project_id, // Explicitly set projectId
      }, ADMIN_APP_NAME_REJECT_API);
      console.log(`[API RejectTask] Firebase Admin SDK initialized (App: ${ADMIN_APP_NAME_REJECT_API}).`);
    } catch (error: any) {
      console.error(`[API RejectTask] Firebase Admin SDK (App: ${ADMIN_APP_NAME_REJECT_API}) initialization error:`, error.message, error.stack);
    }
  }
}

export async function POST(request: NextRequest) {
  console.log("[API RejectTask] POST request received.");
  if (!adminAppInstance) {
    console.error("[API RejectTask] Firebase Admin App not initialized. Cannot process rejection.");
    return NextResponse.json({ error: 'Server configuration error, Firebase not initialized.' }, { status: 500 });
  }
  if (!adminAppInstance.options?.projectId){
    console.error("[API RejectTask] Firebase Admin App initialized, but projectId is missing. Cannot process rejection.");
    return NextResponse.json({ error: 'Server configuration error, Firebase projectId missing.' }, { status: 500 });
  }

  const db = getFirestore(adminAppInstance);

  try {
    const { submissionId } = await request.json();
    console.log(`[API RejectTask] Received submissionId: ${submissionId}`);

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid submissionId' }, { status: 400 });
    }

    const submissionRef = db.collection('userTaskSubmissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      console.log(`[API RejectTask] Submission not found: ${submissionId}`);
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submissionData = submissionDoc.data() as UserTaskSubmission;

    if (submissionData.status !== 'pending_approval') {
      console.log(`[API RejectTask] Submission ${submissionId} is not pending approval. Current status: ${submissionData.status}`);
      return NextResponse.json({ error: 'Task is not pending approval or already processed' }, { status: 400 });
    }

    // Update submission status to 'rejected'
    await submissionRef.update({
      status: 'rejected',
      rewardApplied: false // Ensure rewardApplied is false
    });

    console.log(`[API RejectTask] Submission ${submissionId} rejected for user ${submissionData.userId}.`);
    return NextResponse.json({ message: 'Task rejected successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('[API RejectTask] Error rejecting task:', error);
    return NextResponse.json({ error: 'Failed to reject task', details: error.message }, { status: 500 });
  }
}