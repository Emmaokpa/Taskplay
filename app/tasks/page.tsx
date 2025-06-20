// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\tasks\page.tsx
import React from 'react';
import fs from 'fs'; // Import the 'fs' module
import admin from 'firebase-admin'; // Import the top-level 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import type { PlatformTask } from '@/lib/types'; // Assuming types.ts is in lib and path alias is set
import TaskCard from './TaskCardClient'; // We'll create this client component next
import Header from '../components/Header'; // Import the new Header

// Initialize Firebase Admin SDK (ensure it's done only once)
// For debugging, use a unique name to force new initialization path:
const ADMIN_APP_NAME = `TASKPLAY_ADMIN_APP_DEBUG_${Date.now()}`; 
const serviceAccountKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log("[TasksPage InitDebug] Raw GOOGLE_APPLICATION_CREDENTIALS from env:", serviceAccountKeyPath);


let adminApp: App | undefined; // Initialize as undefined

if (!serviceAccountKeyPath) {
  console.error("CRITICAL: GOOGLE_APPLICATION_CREDENTIALS env var is not set. Firebase Admin SDK cannot be initialized for TasksPage.");
} else {
  // Try to get an existing app with our specific name
  const existingApp = getApps().find(app => app.name === ADMIN_APP_NAME);

  if (existingApp) {
    adminApp = existingApp;
    console.log(`Firebase Admin SDK using existing app instance "${ADMIN_APP_NAME}" for TasksPage.`);
  } else {
    // If our named app doesn't exist, try to initialize it
    try {
      console.log(`[TasksPage InitDebug] Attempting to initialize new app "${ADMIN_APP_NAME}". Path from env: ${serviceAccountKeyPath}`);
      const resolvedPath = require('path').resolve(serviceAccountKeyPath);
      console.log(`[TasksPage InitDebug] Resolved path for service account key: ${resolvedPath}`);

      // Step 1: Read the file content using fs and parse it as JSON
      const fileContent = fs.readFileSync(resolvedPath, 'utf8');
      const serviceAccountJson = JSON.parse(fileContent);

      console.log(`[TasksPage InitDebug] Service Account JSON loaded. Type: ${typeof serviceAccountJson}`);
      if (typeof serviceAccountJson === 'object' && serviceAccountJson !== null) {
        console.log(`[TasksPage InitDebug] project_id from loaded serviceAccountJson: ${serviceAccountJson.project_id}`);
      } else {
        console.error("[TasksPage InitDebug] CRITICAL: serviceAccountJson is not an object or is null after require(). This will cause initialization to fail.");
      }

      // Step 2: Create credential object using admin.credential.cert()
      const credential = admin.credential.cert(serviceAccountJson);
      console.log("[TasksPage InitDebug] Credential object created via admin.credential.cert().");

      adminApp = initializeApp({
        credential: credential, // Use the created credential object
        // Explicitly provide projectId if available from the loaded JSON
        // This might help if the SDK isn't picking it up from the credential object alone.
        projectId: serviceAccountJson.project_id 
      }, ADMIN_APP_NAME); // Initialize with our unique name
      console.log(`Firebase Admin SDK initialized a new app "${ADMIN_APP_NAME}" for TasksPage.`);
    } catch (error: any) {
      console.error(`[TasksPage InitDebug] Firebase Admin SDK (new app "${ADMIN_APP_NAME}") initialization error: ${error.message}`, error.stack);
      // As a fallback, if other apps exist (e.g. default), try to use the first one.
      // This might happen if named initialization fails but a default app was already there.
      if (getApps().length > 0 && !adminApp) { // Check !adminApp to avoid reassigning if try block partially succeeded
        adminApp = getApps()[0];
        console.warn(`Falling back to default/first admin app instance (Name: ${adminApp?.name}) due to error with named app. This might lead to unexpected behavior if its projectId is also undefined.`);
      }
    }
  }
}

if (adminApp) {
  // Use optional chaining for safety, though options should exist on a valid App
  console.log(`[TasksPage InitDebug] CODE IS CONNECTED TO FIREBASE PROJECT ID: ${adminApp.options?.projectId} (App Name: ${adminApp.name})`);
}

async function getPlatformTasks(): Promise<PlatformTask[]> {
  if (!adminApp) {
    console.error("[TasksPage getPlatformTasks] Firebase Admin App is not initialized. Cannot fetch tasks.");
    return [];
  }
  if (!adminApp.options?.projectId) {
    console.error("[TasksPage getPlatformTasks] Firebase Admin App is initialized, but projectId is missing. Cannot reliably fetch tasks.");
    return [];
  }

  const db = getFirestore(adminApp);
  if (!db) { // Should not happen if adminApp is valid
      console.error("[TasksPage getPlatformTasks] CRITICAL: getFirestore(adminApp) returned null or undefined.");
      return [];
  }
  console.log(`[TasksPage getPlatformTasks] Firestore db object obtained for project: ${adminApp.options.projectId}`);

  // If 'status' and 'createdAt' fields might be missing in Firestore,
  // querying by them will result in no tasks.
  // To fetch all tasks and handle missing fields in mapping:
  const collectionName = 'platformTasks';
  console.log(`[TasksPage getPlatformTasks] Attempting to query collection: "${collectionName}"`);

  const tasksQuery = db.collection(collectionName)
                       // .where('status', '==', 'active') // Uncomment if 'status' field exists and you want to filter
                       // .orderBy('createdAt', 'desc'); // Uncomment if 'createdAt' field exists and you want to sort
  
  const taskSnapshot = await tasksQuery.get();
  console.log(`[TasksPage getPlatformTasks] Fetched ${taskSnapshot.size} tasks from collection "${collectionName}".`);

  if (taskSnapshot.empty) {
    console.log(`[TasksPage getPlatformTasks] Snapshot is empty. No documents found in "${collectionName}".`);
  } else {
    console.log(`[TasksPage getPlatformTasks] Snapshot contains ${taskSnapshot.docs.length} documents.`);
    taskSnapshot.docs.forEach(doc => {
        console.log(`[TasksPage getPlatformTasks] Found document ID: ${doc.id}, Data: ${JSON.stringify(doc.data())}`);
    });
  }

  const tasksList = taskSnapshot.docs.map((doc) => {
    const data = doc.data(); 
    return {
      id: doc.id,
      title: data.title || "No Title Provided",
      description: data.description || "No Description",
      rewardAmount: data.rewardAmount || 0,
      link: data.link || "#",
      taskType: data.taskType || "unknown",
      status: data.status || 'active', 
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(0) 
    } as PlatformTask;
  });
  return tasksList;
}


const TasksPage = async () => {
  const tasks = await getPlatformTasks();

  return (
    // The main padding is now handled by the layout's <main> tag
    <div className="w-full p-4 sm:p-6"> {/* Added padding here as layout's main might not have it */}
      <h1 className="text-3xl font-bold mb-6 text-center">Available Tasks</h1>
      {tasks.length === 0 && !adminApp && (
        <p className="text-center text-red-500">Could not connect to the database to fetch tasks. Please check server configuration.</p>
      )}
      {tasks.length === 0 && adminApp && (
        adminApp.options?.projectId ? (
          <p className="text-center text-gray-500">No active tasks available at the moment. Check back soon!</p>
        ) : (
          <p className="text-center text-orange-500">Firebase app initialized, but project ID is missing. Cannot fetch tasks reliably.</p>
        )
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
