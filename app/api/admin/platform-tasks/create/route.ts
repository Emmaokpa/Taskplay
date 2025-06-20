// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\api\admin\platform-tasks\create\route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore'; // Import Timestamp
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { PlatformTask } from '@/lib/types';

const ADMIN_APP_NAME_CREATE_PLATFORM_TASK_API = 'TASKPLAY_CREATE_PLATFORM_TASK_API_V1';
const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let adminAppInstance: App | undefined;

if (!serviceAccountKeyPath) {
  console.error("CRITICAL: GOOGLE_APPLICATION_CREDENTIALS env var is not set for Create Platform Task API.");
} else {
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME_CREATE_PLATFORM_TASK_API);
  if (existingApp) {
    adminAppInstance = existingApp;
  } else {
    try {
      const resolvedPath = path.resolve(serviceAccountKeyPath);
      const serviceAccountJson = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      adminAppInstance = initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        projectId: serviceAccountJson.project_id,
      }, ADMIN_APP_NAME_CREATE_PLATFORM_TASK_API);
      console.log(`[API CreatePlatformTask] Firebase Admin SDK initialized (App: ${ADMIN_APP_NAME_CREATE_PLATFORM_TASK_API}).`);
    } catch (error: any) {
      console.error(`[API CreatePlatformTask] Firebase Admin SDK (App: ${ADMIN_APP_NAME_CREATE_PLATFORM_TASK_API}) init error:`, error.message);
    }
  }
}

export async function POST(request: NextRequest) {
  if (!adminAppInstance || !adminAppInstance.options?.projectId) {
    return NextResponse.json({ error: 'Server configuration error, Firebase not initialized or projectId missing.' }, { status: 500 });
  }

  const db = getFirestore(adminAppInstance);

  try {
    const taskData = await request.json() as Omit<PlatformTask, 'id' | 'createdAt'>;

    // Basic validation
    if (!taskData.title || !taskData.description || typeof taskData.rewardAmount !== 'number' || !taskData.link || !taskData.taskType || !taskData.status) {
      return NextResponse.json({ error: 'Missing required task fields' }, { status: 400 });
    }

    const newTaskData: Omit<PlatformTask, 'id'> = {
      ...taskData,
      createdAt: Timestamp.now(), // Use Firestore Timestamp for createdAt
    };

    const docRef = await db.collection('platformTasks').add(newTaskData);
    console.log(`[API CreatePlatformTask] New platform task created with ID: ${docRef.id}`);

    return NextResponse.json({ message: 'Platform task created successfully', taskId: docRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('[API CreatePlatformTask] Error creating platform task:', error);
    return NextResponse.json({ error: 'Failed to create platform task', details: error.message }, { status: 500 });
  }
}
