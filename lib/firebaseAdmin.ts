// lib/firebaseAdmin.ts
import { initializeApp, cert, getApps, getApp, App as FirebaseAdminApp } from 'firebase-admin/app';
import fs from 'fs';

const adminAppName = 'TASKPLAY_GLOBAL_ADMIN_APP'; // A single, unique name for your global admin app

let adminApp: FirebaseAdminApp;

const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!getApps().find(app => app.name === adminAppName)) {
    let serviceAccountCredentials;
    if (serviceAccountString) {
        try {
            serviceAccountCredentials = JSON.parse(serviceAccountString);
        } catch (e) {
            console.error('[FirebaseAdminLib] Failed to parse service account JSON string:', e);
        }
    } else if (serviceAccountPath) {
        try {
            serviceAccountCredentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        } catch (e) {
            console.error(`[FirebaseAdminLib] Failed to load service account from path '${serviceAccountPath}':`, e);
        }
    }

    if (serviceAccountCredentials) {
        adminApp = initializeApp({ credential: cert(serviceAccountCredentials) }, adminAppName);
        console.log(`[FirebaseAdminLib] Firebase Admin App "${adminAppName}" initialized.`);
    } else {
        console.error('[FirebaseAdminLib] Firebase Admin credentials not found. App not initialized.');
    }
} else {
    adminApp = getApp(adminAppName);
    // console.log(`[FirebaseAdminLib] Firebase Admin App "${adminAppName}" already initialized.`);
}

export { adminApp };
