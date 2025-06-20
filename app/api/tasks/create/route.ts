// route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebaseAdmin'; // Import the centralized adminApp
import type { Task } from '@/lib/types';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!adminApp) {
    console.error('[API /tasks/create] Firebase Admin App from lib/firebaseAdmin.ts is not initialized.');
    return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
  }

  try {
    const {
      title, // Optional title
      description,
      type,
      platform,
      link,
      targetCount,
      rewardPerAction,
    } = await request.json();

    // Basic validation
    if (!type || !link || typeof targetCount !== 'number' || targetCount <= 0 || typeof rewardPerAction !== 'number' || rewardPerAction <= 0) {
      return NextResponse.json({ error: 'Missing or invalid required task fields (type, link, targetCount, rewardPerAction)' }, { status: 400 });
    }

    const db = getFirestore(adminApp);
    const tasksCollectionRef = db.collection('tasks');
    const userRef = db.collection('users').doc(session.user.id); // Reference to the user's document
    const userId = session.user.id;

    // Calculate the total cost of the task
    const totalCost = targetCount * rewardPerAction;

    if (totalCost <= 0) {
      // This should be caught by the validation above, but double-check
      return NextResponse.json({ error: 'Task cost must be positive' }, { status: 400 });
    }

    // Use a Firestore transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Check user's current balance
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        // This case should ideally not happen if users are created on signup/linking
        throw new Error('User profile not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.balance || 0;

      if (currentBalance < totalCost) {
        throw new Error('Insufficient balance');
      }

      // Deduct the cost from the user's balance
      transaction.update(userRef, {
        balance: FieldValue.increment(-totalCost),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const newTaskData: Omit<Task, 'id'> = {
        title: title || `Get ${targetCount} ${platform} followers`, // Default title if none provided
        description: description || '', // Default description to empty string if none provided
        type: type,
        platform: platform || 'other', // Default platform if none provided
        link: link,
        targetCount: targetCount,
        rewardPerAction: rewardPerAction,
        currentCount: 0,
        status: 'active', // Set to 'active' if payment is handled here
        submittedBy_supabaseAuthUserId: userId,
        // submittedBy_telegramId: taskData.telegramId, // Pass this from client if available and needed
        submittedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const newTaskRef = tasksCollectionRef.doc(); // Let Firestore auto-generate the ID

      transaction.set(newTaskRef, newTaskData);
    });

    // If the transaction completes successfully
    return NextResponse.json({ message: 'Task created successfully', status: 'active' }, { status: 201 });

  } catch (error: any) {
    console.error('[API /tasks/create] Error creating task:', error);
    let errorMessage = 'Internal Server Error creating task';
    let statusCode = 500;

    if (error.message === 'User profile not found') {
      errorMessage = 'User profile not found. Please try logging in again.';
      statusCode = 404;
    } else if (error.message === 'Insufficient balance') {
      errorMessage = 'Insufficient balance to create this task.';
      statusCode = 400; // Bad Request
    } else if (error.code === 'ABORTED') {
        // Firestore transaction failed due to contention or other transient error
        errorMessage = 'Failed to create task due to a temporary issue. Please try again.';
        statusCode = 500;
    } else if (error.message.startsWith('Missing or invalid required task fields')) {
         errorMessage = error.message;
         statusCode = 400;
    }


    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
