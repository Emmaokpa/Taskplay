import { adminApp } from '@/lib/firebaseAdmin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { taskId, userId } = await req.json();

    if (!taskId || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (!adminApp) {
      return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    const db = getFirestore(adminApp);

    const taskRef = db.collection('tasks').doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskData = taskSnap.data();

    // 1. Security Check: Is it a direct link and platform task?
    if (taskData?.type !== 'direct' || taskData?.category !== 'earn') {
      return NextResponse.json({ error: 'Unauthorized task type' }, { status: 403 });
    }

    // Attempt Atomic Batch
    const batch = db.batch();

    // 2. Credit the User
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      balance: FieldValue.increment(taskData.userReward || 0)
    });

    // 3. Record as Approved Submission
    const submissionRef = db.collection('submissions').doc();
    batch.set(submissionRef, {
      taskId,
      userId,
      status: 'approved',
      category: 'earn',
      type: 'direct',
      amount: taskData.userReward || 0,
      createdAt: FieldValue.serverTimestamp(),
      approvedAt: FieldValue.serverTimestamp(),
      proofImageUrl: 'direct_link_auto_approval'
    });

    // 4. Update Task Participation
    batch.update(taskRef, {
      currentParticipations: FieldValue.increment(1)
    });

    await batch.commit();

    return NextResponse.json({ success: true, reward: taskData.userReward });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Claim Direct Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
