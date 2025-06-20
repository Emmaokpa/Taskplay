// app/api/tasks/my-tasks/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebaseAdmin'; // Import the centralized adminApp
import type { Task } from '@/lib/types';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!adminApp) {
    console.error('[API /my-tasks] Firebase Admin App from lib/firebaseAdmin.ts is not initialized.');
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const db = getFirestore(adminApp);
    const tasksCollection = db.collection('tasks');
    const tasksQuery = tasksCollection
      .where('submittedBy_supabaseAuthUserId', '==', session.user.id)
      .orderBy('createdAt', 'desc'); // Order by most recent

    const snapshot = await tasksQuery.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 }); // Return empty array if no tasks found
    }

    const userTasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure createdAt and updatedAt are converted to a serializable format (e.g., ISO string or Unix timestamp)
        // Firestore Timestamps are not directly serializable by NextResponse.json
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString(),
      } as Task; // Adjust Task type if necessary to expect string dates for client
    });

    return NextResponse.json(userTasks, { status: 200 });
  } catch (error) {
    console.error('[API /my-tasks] Error fetching user tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching tasks' }, { status: 500 });
  }
}
