// route.ts
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

  // Require authentication to know which tasks the user has completed
  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!adminApp) {
    console.error('[API /tasks/available] Firebase Admin App from lib/firebaseAdmin.ts is not initialized.');
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const db = getFirestore(adminApp);
    const tasksCollectionRef = db.collection('tasks');
    const completionsCollectionRef = db.collection('user_task_completions');

    let completedTaskIds: string[] = [];
    // Fetch task IDs the current user has already completed
    const completedTasksSnapshot = await completionsCollectionRef
      .where('supabase_auth_user_id', '==', session.user.id)
      .select('taskId') // Only fetch the taskId field
      .get();

    if (!completedTasksSnapshot.empty) {
      completedTaskIds = completedTasksSnapshot.docs.map(doc => doc.data().taskId as string);
    }

    // Query for tasks that are 'active'
    const tasksQuery = tasksCollectionRef
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc') // Show newest active tasks first
      .limit(50); // Fetch a slightly larger batch to account for filtering

    const snapshot = await tasksQuery.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const allActiveTasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt?.seconds * 1000 || Date.now())).toISOString(),
        updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt?.seconds * 1000 || Date.now())).toISOString(),
      } as Task;
    });

    // Filter out tasks that the user has already completed OR submitted themselves
    const availableTasks = allActiveTasks.filter(task =>
      !completedTaskIds.includes(task.id) && task.submittedBy_supabaseAuthUserId !== session.user.id
    );

    return NextResponse.json(availableTasks.slice(0, 20), { status: 200 }); // Apply limit after filtering
  } catch (error) {
    console.error('[API /tasks/available] Error fetching available tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching tasks' }, { status: 500 });
  }
}
