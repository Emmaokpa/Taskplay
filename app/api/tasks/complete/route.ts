// route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebaseAdmin'; // Import the centralized adminApp

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { taskId } = await request.json();

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  if (!adminApp) {
    console.error('[API /tasks/complete] Firebase Admin App from lib/firebaseAdmin.ts is not initialized.');
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const db = getFirestore(adminApp);
    const taskRef = db.collection('tasks').doc(taskId);
    const completionsRef = db.collection('user_task_completions');
    const userRef = db.collection('users').doc(session.user.id); // Reference to the user's document
    const userId = session.user.id;

    // Use a Firestore transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      const taskDoc = await transaction.get(taskRef);

      if (!taskDoc.exists) {
        throw new Error('Task not found');
      }

      const taskData = taskDoc.data();

      if (taskData?.status !== 'active') {
        throw new Error('Task is not active');
      }

      // Fetch the user's document to ensure it exists and can be updated
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
         // This case should ideally not happen if users are created on signup/linking
         throw new Error('User profile not found');
      }

      // Check if the user has already completed this task (optional but recommended)
      // This requires an index on user_task_completions collection:
      // supabase_auth_user_id (asc), taskId (asc)
      const existingCompletion = await transaction.get(
        completionsRef
          .where('supabase_auth_user_id', '==', userId)
          .where('taskId', '==', taskId)
          .limit(1)
      );

      if (!existingCompletion.empty) {
        throw new Error('Task already completed by this user');
      }

      // Get the reward amount from the task data
      const rewardAmount = taskData.rewardPerAction;
      if (typeof rewardAmount !== 'number' || rewardAmount <= 0) {
         // This indicates an issue with the task data itself
         throw new Error('Invalid task reward amount');
      }

      // Increment the currentCount on the task
      transaction.update(taskRef, {
        currentCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Record the completion for the user
      transaction.set(completionsRef.doc(), {
        supabase_auth_user_id: userId,
        telegramId: taskData.submittedBy_telegramId, // Optionally store the submitter's Telegram ID for easier lookups/notifications later
        taskId: taskId,
        completedAt: FieldValue.serverTimestamp(),
        rewardApplied: true, // Set to true if auto-approved, false if manual verification is needed
        status: 'verified', // Or 'pending_verification' if manual verification is needed
        rewardAmount: rewardAmount, // Store the reward amount with the completion record
      });

      // Increment the user's balance
      transaction.update(userRef, {
        balance: FieldValue.increment(rewardAmount),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    // If the transaction completes successfully
    return NextResponse.json({ message: 'Task completion recorded successfully', status: 'verified' }, { status: 200 }); // Return status based on rewardApplied/status

  } catch (error: any) {
    console.error('[API /tasks/complete] Error recording task completion:', error);
    let errorMessage = 'Internal Server Error recording task completion';
    let statusCode = 500;

    if (error.message === 'Task not found') {
        errorMessage = 'Task not found';
        statusCode = 404;
    } else if (error.message === 'Task is not active') {
        errorMessage = 'Task is not active or available';
        statusCode = 400;
    } else if (error.message === 'Task already completed by this user') {
        errorMessage = 'You have already completed this task';
        statusCode = 409; // Conflict
    } else if (error.message === 'User profile not found') {
        errorMessage = 'User profile not found. Please try logging in again.';
        statusCode = 404;
    } else if (error.message === 'Invalid task reward amount') {
        errorMessage = 'Task data is invalid.';
        statusCode = 400;
    } else if (error.code === 'ABORTED') {
        // Firestore transaction failed due to contention or other transient error
        errorMessage = 'Failed to record completion due to a temporary issue. Please try again.';
        statusCode = 500;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
