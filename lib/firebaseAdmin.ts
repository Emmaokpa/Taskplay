
import { initializeApp, cert, getApps, getApp, App as FirebaseAdminApp } from 'firebase-admin/app';
const adminAppName = 'TASKPLAY_GLOBAL_ADMIN_APP'; // A single, unique name for your global admin app

let adminApp: FirebaseAdminApp;

const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON_STRING;

if (!getApps().find(app => app.name === adminAppName)) {
    let serviceAccountCredentials;
    if (serviceAccountString) {
        try {
            // Strip surrounding quotes if they exist (common in some .env environments)
            let cleanJson = serviceAccountString.trim();
            if ((cleanJson.startsWith("'") && cleanJson.endsWith("'")) || 
                (cleanJson.startsWith('"') && cleanJson.endsWith('"'))) {
                cleanJson = cleanJson.slice(1, -1);
            }
            serviceAccountCredentials = JSON.parse(cleanJson);
        } catch (e) {
            console.error('[FirebaseAdminLib] Failed to parse service account JSON string:', e);
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
